---
layout: layouts/base.njk
title: Contact
description: Get in touch with Abbas Merchant.
permalink: /contact/
---

<div class="about-hero">
  <h1>Say <em>hello.</em></h1>
</div>

<div class="about-body">
  <p>Got a thought on something I wrote, a question, or just want to say hi? This goes straight to my inbox.</p>

  <form class="contact-form" action="https://api.web3forms.com/submit" method="POST">
    <input type="hidden" name="access_key" value="35cdbcbd-7e2b-4a9f-9c5b-724a3b097e1c" />
    <input type="hidden" name="subject" value="New reader message for abbasmerchant.co" />
    <input type="hidden" name="redirect" value="https://abbasmerchant.co/contact/?sent=true" />
    <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off" />

    <label for="name">Name</label>
    <input type="text" id="name" name="name" required />

    <label for="email">Your email</label>
    <input type="email" id="email" name="email" required />

    <label for="message">Message</label>
    <textarea id="message" name="message" rows="6" required></textarea>

    <button type="submit">Send message</button>
  </form>

  <p id="sent-confirmation" class="sent-confirmation" style="display:none;">
    Thanks — that landed in my inbox. I'll get back to you when I can.
  </p>
</div>

<script>
  if (new URLSearchParams(window.location.search).get('sent') === 'true') {
    document.querySelector('.contact-form').style.display = 'none';
    document.getElementById('sent-confirmation').style.display = 'block';
  }
</script>
