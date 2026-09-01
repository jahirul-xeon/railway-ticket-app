// ============================================================
// EmailJS configuration.  https://dashboard.emailjs.com
//
// 1. Create a free account and add an Email Service (e.g. Gmail) -> Service ID.
// 2. Create an Email Template (see SETUP.md "Email tickets" for the variables
//    and the PDF attachment setup) -> Template ID.
// 3. Account -> General -> copy your Public Key.
// 4. (Recommended for a mobile app) Account -> Security: either paste your
//    Private Key below, or enable "Allow EmailJS calls from non-browser
//    applications". Without one of these, requests from the app are blocked.
// ============================================================
export const EMAILJS = {
  serviceId: "service_h3mzb9t",
  templateId: "template_pj5xevw",
  publicKey: "nM4K60B7bDXQmQcce",
  privateKey: "mQLXKiE4u85mXKnzA6Vg7", // optional accessToken; leave '' if you enabled non-browser calls
};

export const emailjsConfigured = () =>
  !!EMAILJS.serviceId &&
  !EMAILJS.serviceId.startsWith("YOUR_") &&
  !!EMAILJS.templateId &&
  !!EMAILJS.publicKey;
