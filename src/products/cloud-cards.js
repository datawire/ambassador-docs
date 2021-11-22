import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    textAlign: 'center',
    alignItem: 'stretch',
    padding: 0,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: 'black',
    height: '100%',
  },
}));

export default function CenteredGrid() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container justify="center" alignItems="stretch" spacing={1}>
        <Grid item xs={4}>
          <Paper variant="outlined" className={classes.paper}>
            <Typography variant="h6" component="h2">
              <a href="../../howtos/environments/">
                <b>Cloud environment</b>
              </a>
            </Typography>
            <Typography variant="body2" component="p">
              Now that you've completed your development environment setup, learn how to manage it in Ambassador Cloud.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant="outlined" className={classes.paper}>
            <Typography variant="h6" component="h2">
              <a href="../../howtos/complete-k8s/">
                <b>Complete environment setup</b>
              </a>
            </Typography>
            <Typography variant="body2" component="p">
              Learn how to create a local kubernetes development environment.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant="outlined" className={classes.paper}>
            <Typography variant="h6" component="h2">
              <a href="../../concepts/using/">
                <b>Service Catalog Primer</b>
              </a>
            </Typography>
            <Typography variant="body2" component="p">
              Learn more about the Ambassador Cloud Service catalog.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
