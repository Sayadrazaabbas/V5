const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

if (menuButton && navigation) {
  const closeMenu = () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

const inquiryForm = document.querySelector('#inquiry-form');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;

    const data = new FormData(inquiryForm);
    const value = key => String(data.get(key) || '').trim();
    const subject = `CBGIPL business enquiry: ${value('interest')} — ${value('inquiryType')}`;
    const body = [
      `Full name: ${value('fullName')}`,
      `Company / organization: ${value('company')}`,
      `Business email: ${value('email')}`,
      `Phone number: ${value('phone')}`,
      `Country: ${value('country')}`,
      `Area of interest: ${value('interest')}`,
      `Enquiry type: ${value('inquiryType')}`,
      '',
      'Product or project requirements:',
      value('requirements'),
      '',
      'Message:',
      value('message'),
    ].join('\n');

    // GitHub Pages has no mail server. Open the visitor's mail app so they can
    // review and send the enquiry themselves; never claim it was submitted.
    const mailLink = `mailto:info@cbgipl.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector('#form-status').textContent = 'Your email application should open with the enquiry ready to review and send.';
    window.location.href = mailLink;
  });
}
