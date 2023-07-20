import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import { useState, useEffect } from 'react';
import HubspotForm from 'react-hubspot-form';

import { isBrowser } from '../../../../../src/utils/isBrowser';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  titleOverride: {
    borderBottom: 'none',
    paddingBottom: '0px',
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, isSubmitted, ...other } = props;

  const renderCloseButton = () => {
    if (isSubmitted) {
      return (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      );
    }
  };

  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6" className={classes.titleOverride}>
        {children}
      </Typography>
      {renderCloseButton()}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}))(MuiDialogContent);

// UserInterestForm is a wrapper component around the HubspotForm component which prompts a user to provide contact information that can be used for future marketing campaigns.
const UserInterestForm = () => {
  const storageKey = 'ambassador-aes4';

  let [isSubmitted, setIsSubmitted] = useState(false);

  let [isVisible, setIsVisible] = useState(() => {
    if (isBrowser) {
      const saved = localStorage.getItem(storageKey);
      const initialValue = JSON.parse(saved);
      return initialValue ? initialValue.isContactFormVisible : true;
    }

    // don't show if not in browser (aka hide for SSR)
    return false;
  });

  useEffect(() => {
    const data = JSON.stringify({ isContactFormVisible: isVisible });
    localStorage.setItem(storageKey, data);
  }, [isVisible]);

  const handleCloseForm = (e, reason) => {
    if (reason == 'backdropClick' && !isSubmitted) {
      e.preventDefault();
      return;
    }

    setIsVisible(false);
  };

  const handleOnSubmit = () => {
    setIsSubmitted(true);

    // auto-close after 5 seconds if users hasn't already closed
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  return (
    <div>
      <Dialog
        onClose={handleCloseForm}
        aria-labelledby="customized-dialog-title"
        open={isVisible}
        fullWidth={true}
        maxWidth={'md'}
      >
        <DialogTitle
          id="customized-dialog-title"
          onClose={handleCloseForm}
          isSubmitted={isSubmitted}
        >
          {isSubmitted ? 'Thank you...' : 'Join Edge Stack 4 Preview'}
        </DialogTitle>
        <DialogContent dividers>
          <HubspotForm
            portalId="485087"
            formId="12a65b2b-9aef-49ff-8ded-bf9fda0faf10"
            onSubmit={handleOnSubmit}
            loading={<div>Loading signup form...</div>}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserInterestForm;
