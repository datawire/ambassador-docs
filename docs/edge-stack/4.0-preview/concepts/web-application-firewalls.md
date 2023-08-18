import Alert from '@material-ui/lab/Alert';

# Web Application Firewalls

In today's digital landscape, cyber threats are an ever-growing concern and an area of risk for businesses
that are running and deploying internet-facing applications and services. Common attacks such as SQL injection,
cross-site scripting (XSS), and distributed denial-of-service (DDoS) can make it easy for attackers to
compromise the security of your business and platform if you are not protected against them. To mitigate
these risks and ensure the safety of sensitive data, organizations often turn to Web Application Firewalls (WAFs)
as a critical security layer before allowing incoming requests to be processed.

## What is a Web Application Firewall?

A Web Application Firewall (WAF) is a security solution designed to protect web applications from a wide range of
cyber threats. Unlike traditional firewalls, which focus on network traffic, WAFs operate at the application layer,
inspecting HTTP requests and responses to detect and block malicious activity. By analyzing incoming and outgoing
web traffic, WAFs can identify and prevent potential attacks, safeguarding web applications and services from
unauthorized access, data breaches, and other vulnerabilities.

## How Web Application Firewalls Work

Web Application Firewalls implement various security mechanisms to assess and control web traffic. Different WAF solutions will
operate a little differently from each other, but at a high level, their functioning can be summarized as follows:

- **Request Inspection**: When a user sends a request to access a web application or service, the WAF inspects the request parameters,
headers, cookies, and payloads to identify suspicious or malicious patterns.

- **Rule-Based Filtering**: WAFs use predefined rules configured by the organization to compare incoming requests against
known attack patterns. These rules help the WAF determine whether the request is legitimate or potentially harmful.

- **Logging and Monitoring**: WAFs can often maintain detailed logs of the requests they process, allowing administrators to review and analyze
potential security incidents. Real-time monitoring helps in detecting and mitigating attacks promptly.

## PCI Compliance and WAFs

For organizations handling payment card information, compliance with the Payment Card Industry Data Security Standard (PCI DSS)
is essential to ensure secure payment transactions. [PCI DSS Requirement 6.6][] specifically addresses the use of Web Application Firewalls
as an alternative to manual security audits on an interval:

> "Any public-facing web applications are audited either by conducting manual or automated vulnerability security assessments, or via the
deployment of a Web Application Firewall (WAF) in front of web-facing applications."

To comply with PCI requirements, organizations must implement appropriate security measures for their web applications.
Employing a WAF, can be an effective way to fulfill this requirement and also proactively safeguard sensitive
data from potential breaches. For organizations striving to achieve PCI compliance, integrating a WAF, such as those available in $productName$,
is an essential step towards securing sensitive customer data and maintaining a trustworthy online presence.

## Web Application Firewalls in $productName$

$productName$ offers a [comprehensive and user-friendly guide][] to help you create and configure Web Application Firewalls effectively.
By using $productName$ to secure ingress to your applications and services, you can ensure that you are well-protected against
common cyber threats, comply with PCI DSS, and maintain a high level of security.

On top of this, [Ambassador Labs][] publishes and maintains firewall configuration rules for use with $productName$ that you can use to get started securing your web traffic immediately.

While Web Application Firewalls add an important protection layer to your security strategy, it is important to remember to keep the configuration for your
WAFs up-to-date, review logs regularly for suspicious activity (even if it is being blocked by your WAF), and to stay informed about
emerging threats to enhance the overall security of your web applications.

Web Application Firewalls are indispensable security tools for protection against many cyber threats. Still, they should not be the only
tool in your security arsenal. Additional security measures such as authentication are also crucial for ensuring that your services are only
authorized by those who are allowed to. $productName$ also conveniently comes equiped with [Auth Filters][] for all your authentication and Single Sign On needs.

[Auth Filters]: ../../custom-resources/filter
[comprehensive and user-friendly guide]: ../../guides/web-application-firewalls/setup
[PCI DSS Requirement 6.6]: https://listings.pcisecuritystandards.org/documents/information_supplement_6.6.pdf
[Ambassador Labs]: https://www.getambassador.io/
