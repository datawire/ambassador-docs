import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React from 'react';

import HelmIcon from '../../../../../src/assets/icons/helm.inline.svg';
import KubernetesIcon from '../../../../../src/assets/icons/kubernetes.inline.svg';
import CodeBlock from '../../../../../src/components/CodeBlock/CodeBlock';

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

export default function SimpleTabs() {
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
            icon={<HelmIcon loading='lazy'/>}
            label="Helm 3"
            {...a11yProps(0)}
            style={{ minWidth: '10%', textTransform: 'none' }}
          />
          <Tab
            icon={<HelmIcon loading='lazy'/>}
            label="Helm 2"
            {...a11yProps(1)}
            style={{ minWidth: '10%', textTransform: 'none' }}
          />
          <Tab
            icon={<KubernetesIcon loading='lazy'/>}
            label="Kubernetes YAML"
            {...a11yProps(2)}
            style={{ minWidth: '10%', textTransform: 'none' }}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {/*Helm 3 install instructions*/}

        <CodeBlock>
          {'# Add the Repo:' +
            '\n' +
            'helm repo add datawire https://www.getambassador.io' +
            '\n' +
            'helm repo update' +
            '\n \n' +
            'helm install ambassador datawire/ambassador --set enableAES=false && \\' +
            '\n' +
            'kubectl wait --for condition=available --timeout=90s deploy -lproduct=aes'}
        </CodeBlock>
      </TabPanel>

      <TabPanel value={value} index={1}>
        {/*Helm 2 install instructions*/}

        <CodeBlock>
          {'# Add the Repo:' +
            '\n' +
            'helm repo add datawire https://www.getambassador.io' +
            '\n' +
            'helm repo update' +
            '\n \n' +
            'helm install --name ambassador datawire/ambassador --set enableAES=false && \\' +
            '\n' +
            'kubectl wait --for condition=available --timeout=90s deploy -lproduct=aes'}
        </CodeBlock>
      </TabPanel>

      <TabPanel value={value} index={2}>
        {/*YAML install instructions*/}

        <CodeBlock>
          {'kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/ambassador/ambassador-crds.yaml && \\\n' +
            'kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/ambassador/ambassador-rbac.yaml && \\\n' +
            'kubectl apply -f - <<EOF\n' +
            '---\n' +
            'apiVersion: v1\n' +
            'kind: Service\n' +
            'metadata:\n' +
            '  name: ambassador\n' +
            'spec:\n' +
            '  type: LoadBalancer\n' +
            '  externalTrafficPolicy: Local\n' +
            '  ports:\n' +
            '  - port: 80\n' +
            '    targetPort: 8080\n' +
            '  selector:\n' +
            '    service: ambassador\n' +
            'EOF\n'}
        </CodeBlock>
      </TabPanel>
    </div>
  );
}
