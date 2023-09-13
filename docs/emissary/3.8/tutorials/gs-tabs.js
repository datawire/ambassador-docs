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

export default function GettingStartedEmissary21Tabs(props) {
  const version = props.version;
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
          {'# Add the Repo:' +
            '\n' +
            'helm repo add datawire https://app.getambassador.io' +
            '\n' +
            'helm repo update' +
            '\n \n' +
            '# Create Namespace and Install:' +
            '\n' +
            'kubectl create namespace emissary && \\' +
            '\n' +
            `kubectl apply -f https://app.getambassador.io/yaml/emissary/${version}/emissary-crds.yaml` +
            '\n \n' +
            'kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system' +
            '\n \n' +
            'helm install emissary-ingress --namespace emissary datawire/emissary-ingress && \\' +
            '\n' +
            'kubectl -n emissary wait --for condition=available --timeout=90s deploy -lapp.kubernetes.io/instance=emissary-ingress' +
            '\n'}
        </CodeBlock>
      </TabPanel>

      <TabPanel value={value} index={1}>
        {/*YAML install instructions*/}

        <CodeBlock>
          {'kubectl create namespace emissary && \\' +
            '\n' +
            `kubectl apply -f https://app.getambassador.io/yaml/emissary/${version}/emissary-crds.yaml && \\` +
            '\n' +
            'kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system' +
            '\n \n' +
            `kubectl apply -f https://app.getambassador.io/yaml/emissary/${version}/emissary-emissaryns.yaml && \\` +
            '\n' +
            'kubectl -n emissary wait --for condition=available --timeout=90s deploy -lproduct=aes' +
            '\n'}
        </CodeBlock>
      </TabPanel>
      <img referrerPolicy="no-referrer-when-downgrade"
           src="https://static.scarf.sh/a.png?x-pxid=a6dee6ae-7a66-47cb-ab70-2e576b24e521" alt=""
           style={{ display: 'none' }} />
    </div>
  );
}
