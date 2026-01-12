// contexts/PopupContext.js
import { createContext, useContext, useReducer } from 'react';

const PopupContext = createContext();

const initialState = {
  // popup visibility
  login: false,
  becomeHost: false,
  languageAndCurrency: false,
  profileEdit: false,
  propertyDescription: false,
  photoUpload: false,
  propertyAmenities: false,
  contactHost: false,
  bookNow: false,
  specialOfferBookNow: false,
  guestReviews: false,
  showReviews: false,
  hostToGuestReview: false,
  guestToHostReview: false,
  hostBookingDetails: false,
  inviteCoHost: false,
  coHostInviteDetails: false,
  coHostInviteAcceptedDetails: false,
  guestBookingDetails: false,
  reserve: false,
  specialOffer: false,
  filterProperty: false,
  reviewSpecialOffer: false,
  withdrawSpecialOffer: false,
  withdrawPreApproval: false,
  changeReservation: false,
  cancelReservation: false,
  reportGuest: false,
  reportHost: false,
  addPayoutMethod: false,
  updatePayoutMethod: false,
  viewFullReview: false,
  viewAllReview: false,
  houseRules: false,
  transactionHistory: false,
  // popup data
  popupData: {},
};

function popupReducer(state, action) {
  switch (action.type) {
    case 'OPEN_POPUP':
      return {
        ...state,
        [action.key]: true,
        popupData: { ...state.popupData, [action.key]: action.data || null },
      };
    case 'CLOSE_POPUP':
      return {
        ...state,
        [action.key]: false,
        popupData: { ...state.popupData, [action.key]: null },
      };
    case 'CLOSE_ALL_POPUPS':
      return {
        ...Object.keys(state)
          .filter((k) => k !== 'popupData')
          .reduce((acc, k) => ({ ...acc, [k]: false }), {}),
        popupData: {},
      };
    default:
      return state;
  }
}

export const PopupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(popupReducer, initialState);

  const actions = {
    openPopup: (key, data) => dispatch({ type: 'OPEN_POPUP', key, data }),
    closePopup: (key) => dispatch({ type: 'CLOSE_POPUP', key }),
    closeAllPopups: () => dispatch({ type: 'CLOSE_ALL_POPUPS' }),
  };

  return <PopupContext.Provider value={{ popups: state, actions }}>{children}</PopupContext.Provider>;
};

export const usePopups = () => useContext(PopupContext);
