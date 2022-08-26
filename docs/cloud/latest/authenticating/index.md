---
title: "Authentication Overview"
---

# Authentication Overview
<!-- We may need to add SAML to this list if it releases at the same time or prior to our release. -->
Authenticating with Ambassador Cloud is simple! Choose to authenticate via Google, GitHub or GitLab to get started. 

Once you've selected your provider, if this is your first ever login, you will be prompted to create a new Organization. 


# Setting up an Organization

Organizations are based on the domain of the email address of the account you choose to sign in with. 
So, if I'm a new user and sign in with `sally@datawire.io`, you will be prompted to create a new Organization for `datawire.io` unless one already exists. 

<br />
<p style="max-width:600px;margin:0 auto;">
  <img src="../images/authenticating-create-org.png" alt="Create Org"/>
</p>

When creating your organization you will be asked to upload your company log and enter your company URL so we can customize your experience across Ambassador Cloud. 

<br />
<p style="max-width:600px;margin:0 auto;">
  <img src="../images/authenticating-new-org-form.png" alt="New Org"/>
</p>

If you are using GitHub or GitLab, you will be asked to define which provider organization we should trust.

<!-- TODO: add an image of organization idp setup page for GitHub/Gitlab -->

Once you've created your organization you'll be able to continue your login process and proceed to the [Team](#creating-a-team) creation steps.

<Alert severity="info">
  Organizations will only work with custom email domains.
</Alert>

# Joining an already existing Organization

Once an organization has been created for your email domain, any user that signs in with the same domain will be automatically prompted to the team selection page. 

<!-- TODO: add an image of team selection screen -->

There, you will be able to choose which Team to join and start using Ambassador Cloud. 

Administrators can setup the teams to require an additional acceptance to join, once a user selects the team, the administrators will recieve a notification to either accept or deny entry.

When joining an Organization you can still use GitHub or GitLab as your authentication providor but, the primary email on your account must match the domain of the Organization you are trying to join, you will also need to be a member of the GitHub organization.

If you do not want to change the primary email of your GitHub or GitLab account, you will need to sign in with Google using your company email account, or be invited by an administrator.

# Adding a new Team to an already existing Organization

Ambassador Cloud allows you to have many Teams within an Organization.

To add a new team Navigate to your `Settings` Page in Ambassador Cloud, select `Account` and choose the `Create Team` option. 

<!-- TODO: Add screenshot of organization page with create team button -->

You will be redirected back to our login service where you will be prompted with steps to create your new Team. 

<!-- TODO: Add screenshot of create new team page -->

<Alert severity="warning">
  Each Team within Ambassador Cloud is subject to it's own Licenses. See  <a href="../../subscriptions/howtos/manage-my-subscriptions/">Subscriptions</a> for more information.
</Alert>

# Creating a Team

Teams are how you will navigate Ambassador Cloud. A Team is where users will sign in within your Organization, clusters will be connected, and give you the ability to use all the features of Ambassador Cloud. 

At first login after you've created an Organization, a Team will be automatically created for you if you've elected to sign in with Google as your identity provider. 

If you elected to use GitHub or GitLab, you will need to select which organization you want to use for your Ambassador Cloud team. 
This organization will be an extra source of truth for granting access to your Ambassador Cloud team.