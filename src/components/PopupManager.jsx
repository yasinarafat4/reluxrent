import BecomeHostPopup from './popups/BecomeHostPopup';
import FilterPopup from './popups/FilterPopup';
import BookNowPopup from './popups/guest/BookNowPopup';
import GuestBookingDetailsPopup from './popups/guest/GuestBookingDetailsPopup';
import GuestToHostReviewPopup from './popups/guest/GuestToHostReviewPopup';
import ReportHostPopup from './popups/guest/ReportHostPopup';
import ShowGuestReviewsPopup from './popups/guest/ShowGuestReviewsPopup';
import SpecialOfferBookNowPopup from './popups/guest/SpecialOfferBookNowPopup';
import AddPayoutMethodPopup from './popups/host/AddPayoutMethodPopup';
import CancelReservationPopup from './popups/host/CancelReservationPopup';
import ChangeReservationPopup from './popups/host/ChangeReservationPopup';
import CoHostInviteAcceptedDetailsPopup from './popups/host/CoHostInviteAcceptedDetailsPopup';
import CoHostInviteDetailsPopup from './popups/host/CoHostInviteDetailsPopup';
import GuestReviewsPopup from './popups/host/GuestReviewsPopup';
import HostBookingDetailsPopup from './popups/host/HostBookingDetailsPopup';
import HostToGuestReviewPopup from './popups/host/HostToGuestReviewPopup';
import InviteCoHostPopup from './popups/host/InviteCoHostPopup';
import PhotoUploadPopup from './popups/host/PhotoUploadPopup';
import ReportGuestPopup from './popups/host/ReportGuestPopup';
import ReviewSpecialOfferPopup from './popups/host/ReviewSpecialOfferPopup';
import ShowHostReviewsPopup from './popups/host/ShowHostReviewsPopup';
import SpecialOfferPopup from './popups/host/SpecialOfferPopup';
import TransactionHistoryPopup from './popups/host/TransactionHistoryPopup';
import UpdatePayoutMethodPopup from './popups/host/UpdatePayoutMethodPopup';
import WithdrawPreApprovalPopup from './popups/host/WithdrawPreApprovalPopup';
import WithdrawSpecialOfferPopup from './popups/host/WithdrawSpecialOfferPopup';
import LanguageAndCurrencyPopup from './popups/LanguageAndCurrencyPopup';
import LoginPopup from './popups/LoginPopup';
import ProfileEditPopup from './popups/ProfileEditPopup';
import ContactHostPopup from './popups/rooms/ContactHostPopup';
import HouseRulesPopup from './popups/rooms/HouseRulesPopup';
import PropertyAmenitiesPopup from './popups/rooms/PropertyAmenitiesPopup';
import PropertyDescriptionPopup from './popups/rooms/PropertyDescriptionPopup';
import ReservePopup from './popups/rooms/ReservePopup';
import ViewAllReviewsPopup from './popups/rooms/ViewAllReviewsPopup';
import ViewFullReviewPopup from './popups/rooms/ViewFullReviewPopup';

const popupComponents = {
  login: LoginPopup,
  becomeHost: BecomeHostPopup,
  languageAndCurrency: LanguageAndCurrencyPopup,
  profileEdit: ProfileEditPopup,
  bookNow: BookNowPopup,
  specialOfferBookNow: SpecialOfferBookNowPopup,
  changeReservation: ChangeReservationPopup,
  cancelReservation: CancelReservationPopup,
  guestReviews: GuestReviewsPopup,
  showHostReviews: ShowHostReviewsPopup,
  showGuestReviews: ShowGuestReviewsPopup,
  reviewSpecialOffer: ReviewSpecialOfferPopup,
  hostToGuestReview: HostToGuestReviewPopup,
  inviteCoHost: InviteCoHostPopup,
  coHostInviteDetails: CoHostInviteDetailsPopup,
  coHostInviteAcceptedDetails: CoHostInviteAcceptedDetailsPopup,
  guestToHostReview: GuestToHostReviewPopup,
  hostBookingDetails: HostBookingDetailsPopup,
  guestBookingDetails: GuestBookingDetailsPopup,
  reserve: ReservePopup,
  specialOffer: SpecialOfferPopup,
  filterProperty: FilterPopup,
  withdrawSpecialOffer: WithdrawSpecialOfferPopup,
  withdrawPreApproval: WithdrawPreApprovalPopup,
  contactHost: ContactHostPopup,
  propertyAmenities: PropertyAmenitiesPopup,
  propertyDescription: PropertyDescriptionPopup,
  photoUpload: PhotoUploadPopup,
  reportGuest: ReportGuestPopup,
  reportHost: ReportHostPopup,
  addPayoutMethod: AddPayoutMethodPopup,
  updatePayoutMethod: UpdatePayoutMethodPopup,
  viewFullReview: ViewFullReviewPopup,
  viewAllReview: ViewAllReviewsPopup,
  houseRules: HouseRulesPopup,
  transactionHistory: TransactionHistoryPopup,
};

export default function PopupManager({ popups, dispatch, popupData }) {
  if (!popups || !popupData) return null;

  return (
    <>
      {Object.keys(popupComponents).map((key) => {
        const Component = popupComponents[key];
        const isOpen = popups[key];
        const data = popupData[key];

        return isOpen ? <Component key={key} showModal={isOpen} closeModal={() => dispatch.closePopup(key)} popupData={data} /> : null;
      })}
    </>
  );
}
