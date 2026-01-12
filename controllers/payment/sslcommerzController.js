const SSLCommerzPayment = require('sslcommerz-lts');
const prisma = require('../../config/prisma');
const { format, addHours } = require('date-fns');
const { findTranslation } = require('../../helpers/findTranslation');
const { customAlphabet } = require('nanoid');
const logActivity = require('../../helpers/logActivity');
const { formatGuestSummary } = require('../../helpers/formatGuestSummary');
const { sendEmail } = require('../../email/emailService');
const { formatPrice, convertAndFormatBookedCurrency } = require('../../helpers/formatPrice');
const { sendUserNotification } = require('../../helpers/notificationService');
const { sendEmailWithRetry } = require('../../helpers/sendEmailWithRetry');
const { connect } = require('http2');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateConfirmationCode = customAlphabet(alphabet, 10);

function convertToDefaultCurrency(amount, fromCurrency, toCurrency) {
  if (!amount || !fromCurrency || !toCurrency) return parseFloat(amount) || 0;

  const fromRate = parseFloat(fromCurrency.exchangeRate);
  const toRate = parseFloat(toCurrency.exchangeRate);

  if (!fromRate || !toRate) return parseFloat(amount) || 0;

  const converted = (parseFloat(amount) * toRate) / fromRate;
  return parseFloat(converted.toFixed(toCurrency.decimalPlaces || 2));
}

module.exports = {
  async initPayment(req, res) {
    const { bookingId, totalPrice, totalDiscount, totalGuestFee, totalHostFee, cleaningCharge, bookingCurrency, propertyCurrency, defaultCurrency, customerInfo } = req.body;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const tran_id = `Tran-${bookingId}-${Date.now()}`;

    const convertedTotalPrice = convertToDefaultCurrency(
      (parseFloat(totalPrice) || 0) - (parseFloat(totalDiscount) || 0) + (parseFloat(totalGuestFee) || 0) + (parseFloat(cleaningCharge) || 0),
      propertyCurrency,
      defaultCurrency,
    );

    const data = {
      total_amount: convertedTotalPrice,
      currency: defaultCurrency.code,
      tran_id,
      success_url: `${baseUrl}/api/payment/payment-success`,
      fail_url: `${baseUrl}/api/payment/payment-fail`,
      cancel_url: `${baseUrl}/api/payment/payment-cancel`,
      ipn_url: `${baseUrl}/api/payment/payment-ipn`,
      cus_name: customerInfo.name,
      cus_email: customerInfo.email,
      cus_phone: customerInfo.phone,
      product_profile: 'non-physical-goods',
      product_name: 'Online Room booking',
      product_category: 'room booking',
      shipping_method: 'NO',
      emi_option: 0,
    };

    try {
      // 1️⃣ Create pending payment record
      await prisma.payment.create({
        data: {
          user: {
            connect: {
              id: req.user.id,
            },
          },
          transactionId: tran_id,
          status: 'PENDING',
          booking: { connect: { id: bookingId } }, // link to booking
        },
      });

      const sslcz = new SSLCommerzPayment(process.env.SSLC_STORE_ID, process.env.SSLC_STORE_PASSWORD, process.env.SSLC_IS_LIVE === 'true');
      const apiResponse = await sslcz.init(data);

      if (apiResponse?.GatewayPageURL) {
        return res.json({ GatewayPageURL: apiResponse.GatewayPageURL });
      } else {
        return res.status(400).json({ error: apiResponse.failedreason });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async verifyPayment(req, res) {
    const { tran_id } = req.body;
    const data = {
      val_id: tran_id, //that you go from sslcommerz response
    };
    try {
      const sslcz = new SSLCommerzPayment(process.env.store_id, process.env.store_passwd, process.env.is_live);
      sslcz.validate(data).then((data) => {
        //process the response that got from sslcommerz
        // https://developer.sslcommerz.com/doc/v4/#order-validation-api
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Payment verification failed' });
    }
  },

  async initiateRefund(req, res) {
    const { tran_id } = req.body;
    const data = {
      refund_amount: 10,
      refund_remarks: '',
      bank_tran_id: CB5464321445456456,
      refe_id: EASY5645415455,
    };
    try {
      const sslcz = new SSLCommerzPayment(process.env.store_id, process.env.store_passwd, process.env.is_live);
      sslcz.initiateRefund(data).then((data) => {
        //process the response that got from sslcommerz
        //https://developer.sslcommerz.com/doc/v4/#initiate-the-refund
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Payment verification failed' });
    }
  },

  async paymentSuccess(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const { val_id, tran_id, status, amount, store_amount, card_type } = req.body;
    try {
      const sslcz = new SSLCommerzPayment(process.env.SSLC_STORE_ID, process.env.SSLC_STORE_PASSWORD, process.env.SSLC_IS_LIVE === 'true');

      const validation = await sslcz.validate({ val_id });

      if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
        // Update booking
        const booking = await prisma.booking.update({
          where: { id: validation.tran_id.split('-')[1] },
          data: {
            confirmationCode: generateConfirmationCode(),
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'PAID',
            confirmedAt: new Date(),
          },
          include: {
            property: {
              include: {
                propertyDescription: {
                  include: {
                    propertyDescriptionTranslation: true,
                  },
                },
                propertyImages: { orderBy: { serial: 'asc' } },
                propertyPrice: {
                  include: {
                    currency: true,
                  },
                },
              },
            },
            guest: true,
            host: {
              include: {
                payoutMethods: {
                  where: { isDefault: true },
                },
              },
            },
            specialOffer: true,
            currency: true,
          },
        });
        console.log('$Booking', booking);
        if (booking.specialOffer) {
          await prisma.specialOffer.update({
            where: { id: booking.specialOffer.id },
            data: { status: 'ACCEPTED' },
          });
        }

        await prisma.payment.update({
          where: { transactionId: tran_id },
          data: {
            status: 'PAID',
            amount: Number(validation.amount),
            transactionDate: new Date(validation.tran_date),
            rawResponse: validation,
          },
        });

        const payoutDate = addHours(new Date(booking.endDate), 24);

        await prisma.payouts.create({
          data: {
            user: {
              connect: {
                id: booking.hostId,
              },
            },
            booking: {
              connect: {
                id: booking.id,
              },
            },

            ...(booking.host.payoutMethods[0]?.id && {
              payoutMethod: {
                connect: { id: booking.host.payoutMethods[0].id },
              },
            }),
            currency: {
              connect: {
                id: booking.currencyId,
              },
            },
            payoutAmount: booking.totalPrice - booking.totalHostFee,
            payoutDate,
          },
        });

        const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
        let conversation;
        let conversationBooking;
        if (booking) {
          // 2️⃣ Find or create Conversation (per property per guest)
          conversation = await prisma.conversation.findFirst({
            where: {
              propertyId: booking.propertyId,
              participants: { some: { userId: booking.guestId } }, // only find conversation this guest is part of
            },
            include: { participants: true },
          });

          if (!conversation) {
            conversation = await prisma.conversation.create({
              data: {
                propertyId: booking.propertyId,
                participants: {
                  create: [
                    { userId: booking.guestId, role: 'GUEST' },
                    { userId: booking.hostId, role: 'HOST' },
                  ],
                },
              },
              include: { participants: true },
            });
          } else {
            // 3️⃣ Ensure participants exist
            const existingUserIds = conversation.participants.map((p) => p.userId);
            const toAdd = [];
            if (!existingUserIds.includes(booking.guestId)) toAdd.push({ userId: booking.guestId, role: 'GUEST' });
            if (!existingUserIds.includes(booking.hostId)) toAdd.push({ userId: booking.hostId, role: 'HOST' });
            if (toAdd.length > 0) {
              await prisma.conversationParticipant.createMany({
                data: toAdd.map((p) => ({ ...p, conversationId: conversation.id })),
              });
            }
          }

          // 4️⃣ Create ConversationBooking for this booking
          conversationBooking = await prisma.conversationBooking.create({
            data: {
              conversationId: conversation.id,
              bookingId: booking.id,
            },
          });

          // 5️⃣ Insert SYSTEM + USER messages
          const systemMessage = await prisma.conversationMessage.create({
            data: {
              conversationBookingId: conversationBooking.id,
              senderId: booking.hostId,
              text: `Booking CONFIRMED · ${formatGuestSummary(booking.guests)}, ${format(booking.startDate, 'MMM dd')} - ${format(booking.endDate, 'MMM dd, yyyy')}`,
              type: 'SYSTEM',
            },
          });

          const userMessage = await prisma.conversationMessage.create({
            data: {
              conversationBookingId: conversationBooking.id,
              senderId: booking.guestId,
              text: 'Booking CONFIRMED',
              metadata: {
                bookingId: booking.id,
                status: 'CONFIRMED',
                title: propertyDesc.name,
                dates: { start: booking.startDate, end: booking.endDate },
                imageUrl: booking?.property?.propertyImages[0].image || '',
                action: { type: 'BookingConfirmed', link: '', text: 'Show Details' },
              },
              type: 'TEXT',
            },
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              lastMessageId: userMessage.id,
              lastMessageAt: userMessage.createdAt,
            },
          });
        }

        // Activity log
        await logActivity(req, booking.guest.id, 'Payment Success', {
          details: `Payment completed for Booking ID ${booking.id} (Property ID: ${booking.property.id}) for ${booking.totalNight} night(s) from ${booking.startDate} to ${booking.endDate}. Total price: ${booking.totalPrice} ${booking.currency?.code}.`,
        });

        // Notification for Host
        const notificationData = {
          title: `New booking`,
          body: `A new booking (#${booking.id}) has been made by ${booking?.guest?.name || 'A guest'}. Check the details in your dashboard.`,
          link: `/bookings/`,
        };

        await sendUserNotification({ userId: booking?.host?.id, fcmToken: booking?.host?.fcmToken, notificationData });

        // Email to Host
        await sendEmailWithRetry({
          to: booking?.host?.email,
          subject: 'New booking',
          templateName: 'newBookingHost',
          data: {
            year: new Date().getFullYear(),
            hostName: booking?.host?.name,
            guestName: booking?.guest?.name,
            bookingId: booking?.id,
            checkIn: format(booking?.startDate, 'dd/MM/yyyy'),
            checkOut: format(booking?.endDate, 'dd/MM/yyyy'),
            totalNight: booking?.totalNight,
            nightText: booking?.totalNight > 1 ? 'nights' : 'night',
            totalPrice: formatPrice(
              booking?.property?.propertyPrice?.currency,
              parseFloat(booking?.totalPrice) + parseFloat(booking?.cleaningCharge) + parseFloat(booking?.totalGuestFee) - parseFloat(booking?.totalDiscount),
            ),
            propertyName: propertyDesc?.name,
          },
        });

        // Email to Guest
        await sendEmailWithRetry({
          to: booking?.guest?.email,
          subject: 'New booking',
          templateName: 'newBookingGuest',
          data: {
            year: new Date().getFullYear(),
            hostName: booking?.host?.name,
            guestName: booking?.guest?.name,
            bookingId: booking?.id,
            checkIn: format(booking?.startDate, 'dd/MM/yyyy'),
            checkOut: format(booking?.endDate, 'dd/MM/yyyy'),
            totalNight: booking?.totalNight,
            nightText: booking?.totalNight > 1 ? 'nights' : 'night',
            totalPrice: convertAndFormatBookedCurrency({
              orderCurrency: booking?.currency,
              exchangeRateToBase: booking?.exchangeRateToBase,
              exchangeRatePropertyToBase: booking?.exchangeRatePropertyToBase,
              price: parseFloat(booking?.totalPrice) + parseFloat(booking?.cleaningCharge) + parseFloat(booking?.totalGuestFee) - parseFloat(booking?.totalDiscount),
            }),
            propertyName: propertyDesc?.name,
            paymentDate: format(validation?.validated_on, 'dd/MM/yyyy'),
            paymentMethod: validation?.card_issuer,
            paymentStatus: booking?.paymentStatus,
            paymentAmount: validation?.amount,
          },
        });

        return res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/guest/messages/${conversation.id}`);
      } else {
        return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-fail?tran_id=${tran_id}`);
      }
    } catch (error) {
      console.error('Payment success error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async paymentFail(req, res) {
    const lang = (req.query.lang || 'en').trim();
    try {
      const { tran_id } = req.body;

      // update the existing Payment row
      await prisma.payment.update({
        where: { transactionId: tran_id },
        data: { status: 'FAILED' },
      });

      const booking = await prisma.booking.update({
        where: { id: tran_id.split('-')[1] },
        data: { bookingStatus: 'PENDING', paymentStatus: 'FAILED' },
        include: {
          property: {
            include: {
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },
            },
          },
          specialOffer: true,
          currency: true,
          guest: true,
          host: {
            include: {
              payoutMethods: {
                where: { isDefault: true },
              },
            },
          },
        },
      });

      await prisma.payment.update({
        where: { transactionId: tran_id },
        data: {
          status: 'FAILED',
          rawResponse: '',
        },
      });

      console.log('PaymentFailedBooking', booking);
      // const booking = await prisma.booking.update({
      //           where: { id: validation.tran_id.split('-')[1] },
      //           data: {
      //             confirmationCode: generateConfirmationCode(),
      //             bookingStatus: 'CONFIRMED',
      //             paymentStatus: 'PAID',
      //             confirmedAt: new Date(),
      //           },
      //           include: {
      //             property: {
      //               include: {
      //                 propertyDescription: {
      //                   include: {
      //                     propertyDescriptionTranslation: true,
      //                   },
      //                 },
      //                 propertyImages: { orderBy: { serial: 'asc' } },
      //               },
      //             },
      //             guest: true,
      //             host: {
      //               include: {
      //                 payoutMethods: {
      //                   where: { isDefault: true },
      //                 },
      //               },
      //             },
      //             specialOffer: true,
      //             currency: true,
      //           },
      //         });

      const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
      console.log('PaymentFailedPropertyDesc', propertyDesc);

      let conversation;
      if (booking) {
        // 2️⃣ Find or create Conversation (per property per guest)
        conversation = await prisma.conversation.findFirst({
          where: {
            propertyId: booking.propertyId,
            participants: { some: { userId: booking.guestId } }, // only find conversation this guest is part of
          },
          include: { participants: true },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              propertyId: booking.propertyId,
              participants: {
                create: [
                  { userId: booking.guestId, role: 'GUEST' },
                  { userId: booking.hostId, role: 'HOST' },
                ],
              },
            },
            include: { participants: true },
          });
        } else {
          // 3️⃣ Ensure participants exist
          const existingUserIds = conversation.participants.map((p) => p.userId);
          const toAdd = [];
          if (!existingUserIds.includes(booking.guestId)) toAdd.push({ userId: booking.guestId, role: 'GUEST' });
          if (!existingUserIds.includes(booking.hostId)) toAdd.push({ userId: booking.hostId, role: 'HOST' });
          if (toAdd.length > 0) {
            await prisma.conversationParticipant.createMany({
              data: toAdd.map((p) => ({ ...p, conversationId: conversation.id })),
            });
          }
        }

        // 4️⃣ Create ConversationBooking for this booking
        const conversationBooking = await prisma.conversationBooking.create({
          data: {
            conversationId: conversation.id,
            bookingId: booking.id,
          },
        });

        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: booking.hostId,
            text: `Your booking could not be completed because the payment was unsuccessful. Please try again to confirm your booking.`,
            type: 'SYSTEM',
          },
        });

        const userMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: booking.guestId,
            text: 'Payment was unsuccessful',
            metadata: {
              bookingId: booking.id,
              status: 'Unsuccessful',
              title: propertyDesc.name,
              dates: { start: booking.startDate, end: booking.endDate },
              imageUrl: booking?.property?.propertyImages[0].image || '',
              action: { type: 'BookingUnsuccessful', link: booking.specialOffer ? 'specialOfferBookNow' : 'bookNow', text: 'Try again' },
            },
            type: 'TEXT',
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageId: userMessage.id,
            lastMessageAt: userMessage.createdAt,
          },
        });
      }

      // Notification for Host
      const notificationData = {
        title: `Guest payment failed`,
        body: `${booking?.guest?.name || 'A guest'} tried to book "${propertyDesc?.name}", but the payment was unsuccessful.`,
        link: `/host/reservations/details/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.host?.id, fcmToken: booking?.host?.fcmToken, notificationData });

      // Email to Host
      await sendEmail({
        to: booking?.host?.email,
        subject: 'Guest payment failed for your listing',
        templateName: 'paymentFailedHost',
        data: {
          year: new Date().getFullYear(),
          hostName: booking?.host?.name,
          guestName: booking.guest?.name,
          propertyName: propertyDesc?.name,
          bookingId: booking?.id,
          checkIn: format(booking?.startDate, 'dd/MM/yyyy'),
          checkOut: format(booking?.endDate, 'dd/MM/yyyy'),
        },
      });

      // Email to Guest
      await sendEmail({
        to: booking?.guest?.email,
        subject: 'Your payment was unsuccessful — please try again',
        templateName: 'paymentFailedGuest',
        data: {
          year: new Date().getFullYear(),
          guestName: booking.guest?.name,
          propertyName: propertyDesc?.name,
          bookingId: booking?.id,
        },
      });

      return res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/guest/messages`);
    } catch (err) {
      console.error('Payment fail error:', err);
      return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-error`);
    }
  },

  async paymentCancel(req, res) {
    const lang = (req.query.lang || 'en').trim();
    try {
      const { tran_id } = req.body;

      await prisma.payment.update({
        where: { transactionId: tran_id },
        data: { status: 'CANCELLED' },
      });

      const booking = await prisma.booking.update({
        where: { id: tran_id.split('-')[1] },
        data: { bookingStatus: 'PENDING', paymentStatus: 'CANCELLED' },
        include: {
          property: {
            include: {
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },
            },
          },
          specialOffer: true,
          currency: true,
          guest: true,
          host: {
            include: {
              payoutMethods: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
      const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

      let conversation;
      if (booking) {
        // 2️⃣ Find or create Conversation (per property per guest)
        conversation = await prisma.conversation.findFirst({
          where: {
            propertyId: booking.propertyId,
            participants: { some: { userId: booking.guestId } }, // only find conversation this guest is part of
          },
          include: { participants: true },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              propertyId: booking.propertyId,
              participants: {
                create: [
                  { userId: booking.guestId, role: 'GUEST' },
                  { userId: booking.hostId, role: 'HOST' },
                ],
              },
            },
            include: { participants: true },
          });
        } else {
          // 3️⃣ Ensure participants exist
          const existingUserIds = conversation.participants.map((p) => p.userId);
          const toAdd = [];
          if (!existingUserIds.includes(booking.guestId)) toAdd.push({ userId: booking.guestId, role: 'GUEST' });
          if (!existingUserIds.includes(booking.hostId)) toAdd.push({ userId: booking.hostId, role: 'HOST' });
          if (toAdd.length > 0) {
            await prisma.conversationParticipant.createMany({
              data: toAdd.map((p) => ({ ...p, conversationId: conversation.id })),
            });
          }
        }

        // 4️⃣ Create ConversationBooking for this booking
        const conversationBooking = await prisma.conversationBooking.create({
          data: {
            conversationId: conversation.id,
            bookingId: booking.id,
          },
        });

        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: booking.hostId,
            text: `Your booking could not be completed because the payment was cancelled. Please proceed with payment to confirm your booking.`,
            type: 'SYSTEM',
          },
        });

        const userMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: booking.guestId,
            text: 'Payment was cancelled',
            metadata: {
              bookingId: booking.id,
              status: 'CANCELLED',
              title: propertyDesc.name,
              dates: { start: booking.startDate, end: booking.endDate },
              imageUrl: booking?.property?.propertyImages[0].image || '',
              action: { type: 'BookingUnsuccessful', link: booking.specialOffer ? 'specialOfferBookNow' : 'bookNow', text: 'Try again' },
            },
            type: 'TEXT',
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageId: userMessage.id,
            lastMessageAt: userMessage.createdAt,
          },
        });
      }

      // Notification for Host
      const notificationData = {
        title: 'Payment cancelled',
        body: `${booking?.guest?.name || 'A guest'} started booking "${propertyDesc?.name}" but cancelled before completing the payment.`,
        link: `/host/reservations/details/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.host?.id, fcmToken: booking?.host?.fcmToken, notificationData });

      // Email to Host
      await sendEmail({
        to: booking?.host?.email,
        subject: 'Guest cancelled the payment for your listing',
        templateName: 'paymentCancelledHost',
        data: {
          year: new Date().getFullYear(),
          hostName: booking?.host?.name,
          guestName: booking.guest?.name,
          propertyName: propertyDesc?.name,
          bookingId: booking?.id,
          checkIn: format(booking?.startDate, 'dd/MM/yyyy'),
          checkOut: format(booking?.endDate, 'dd/MM/yyyy'),
        },
      });

      // Email to Guest
      await sendEmail({
        to: booking?.guest?.email,
        subject: 'You cancelled your payment — booking not completed',
        templateName: 'paymentCancelledGuest',
        data: {
          year: new Date().getFullYear(),
          guestName: booking.guest?.name,
          propertyName: propertyDesc?.name,
          bookingId: booking?.id,
        },
      });

      return res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/guest/messages`);
    } catch (err) {
      console.error('Payment cancel error:', err);
      return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-error`);
    }
  },

  async paymentIPN(req, res) {
    console.log('Payment IPN:', req.body);
    // ✅ SSLCommerz server-to-server notification
    // Validate payment & update DB if needed

    res.status(200).send('IPN received');
  },
};
