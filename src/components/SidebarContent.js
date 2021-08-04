import React, { Component } from 'react';

import SidebarTopics from '../../../src/components/SidebarTopics';
import Sidebar from '../components/Sidebar';
import { archivedVersionsLink } from '../config';

class SidebarContent extends Component {

  state = { isClient: false }

  componentDidMount() {
    this.setState({ isClient: true });
  }

  hasArchivedVersions = this.props.versionList.some(v => v.archived);
  newVersions = this.props.versionList.filter(v => !v.archived);
  versionsToShow = this.hasArchivedVersions ? this.newVersions.concat(archivedVersionsLink) : this.newVersions;

  render() {
    return <React.Fragment key={this.state.isClient}>
      {this.state.isClient && (this.props.isLearning ?
        <div className="learning-journey__sidebar docs__desktop">
          <SidebarTopics
            title={this.props.title}
            description={this.props.description}
            readingTime={this.props.readingTime}
            sidebarTopicList={this.props.sidebarTopicList}
            path={this.props.path}
            glossaryView={false}
          />
        </div>
        :
        <Sidebar
          onVersionChanged={this.props.onVersionChanged}
          version={this.props.version}
          versionList={this.versionsToShow}
          topicList={this.props.topicList}
          archivedVersionsLink={archivedVersionsLink}
          slug={this.props.slug}
        />
      )}
    </React.Fragment>
  }
}

export default SidebarContent;