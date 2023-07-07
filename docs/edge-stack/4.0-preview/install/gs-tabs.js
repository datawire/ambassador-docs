import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React from 'react';

import CodeBlock from '../../../../../src/components/CodeBlock';
import Icon from '../../../../../src/components/Icon';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
}));

export default function GettingStartedEdgeStack4PreviewTabs(props) {
  const version = props.version;
  const chartVersion = props.chartVersion;
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar
        elevation={0}
        style={{
          background: 'transparent',
          color: 'black',
          borderBottom: '1px solid #e8e8e8',
        }}
        position="static"
      >
        <Tabs
          TabIndicatorProps={{ style: { background: '#AF5CF8' } }}
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab
            icon={<Icon name="helm" />}
            label="Helm 3"
            {...a11yProps(0)}
            style={{ minWidth: '10%', textTransform: 'none' }}
          />
          <Tab
            icon={<Icon name="kubernetes" />}
            label="Kubernetes YAML"
            {...a11yProps(1)}
            style={{ minWidth: '10%', textTransform: 'none' }}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {/*Helm 3 install instructions*/}

        <CodeBlock>
          {`helm repo add ambassador-dev https://s3.amazonaws.com/datawire-static-files/charts-dev` +
            `\n` +
            `helm repo update` +
            `\n \n` +
            `version=$(helm show chart --devel ambassador-dev/eg-edge-stack | grep version | sed 's/version: //')` +
            `\n \n` +
            `kubectl create namespace ambassador && \\` +
            `\n` +
            `helm install edge-stack-crds --namespace ambassador ambassador-dev/eg-edge-stack-crds --devel --version $version && \\` +
            `\n` +
            `helm install edge-stack --namespace ambassador ambassador-dev/eg-edge-stack --devel --version $version && \\` +
            `\n` +
            `kubectl -n ambassador wait --for condition=available --timeout=90s deploy -l control-plane=envoy-gateway`}
        </CodeBlock>
      </TabPanel>

      <TabPanel value={value} index={1}>
        {/*YAML install instructions*/}

        <CodeBlock>
          {`kubectl apply -f https://app.getambassador.io/yaml/edge-stack/${version}/aes-crds.yaml && \\` +
            '\n' +
            `kubectl apply -f https://app.getambassador.io/yaml/edge-stack/${version}/aes.yaml && \\` +
            '\n' +
            'kubectl -n ambassador wait --for condition=available --timeout=90s deploy -l control-plane=envoy-gateway' +
            '\n'}
        </CodeBlock>
      </TabPanel>
    </div>
  );
}
