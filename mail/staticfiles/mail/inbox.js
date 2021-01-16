document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = () => {

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });
      
    return false;
  }
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/<str:mailbox>')
    .then(response => response.json)
    .then(emails => {
      console.log(emails);

      emails.forEach(element => {
        const sender = document.createElement('div');
        const subject = document.createElement('div');
        const timestamp = document.createElement('div');
        sender.className = 'col-md-3';
        subject.className = 'col-md-6';
        timestamp.className = 'col-md-3';
        sender.innerHTML = `<h5>${emails[i].sender}</h5>`;
        subject.innerHTML = `${emails[i].subject}`;
        timestamp.innerHTML = `${emails[i].timestamp}`;
        document.querySelector('#mail').append(sender);
        document.querySelector('#mail').append(subject);
        document.querySelector('#mail').append(timestamp);
      });
    });
}
