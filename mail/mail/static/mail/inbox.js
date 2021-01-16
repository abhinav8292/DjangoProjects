document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(false, undefined));

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email(reply, email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-inside-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (!reply) {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#mail-inside-view').style.display = 'none';

    document.querySelector('#compose-view').style.display = 'block';

    if (document.querySelector('#logged_user').innerHTML === email.sender) {
      document.querySelector('#compose-recipients').value = `${email.recipients}`;
    } else {
      document.querySelector('#compose-recipients').value = `${email.sender}`;
    }

    if (email.subject.includes("Re:")) {
      document.querySelector('#compose-subject').value = `${email.subject}`;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }

    document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: ${email.body}`;
  }


  document.querySelector('#compose-form').onsubmit = () => {

    async function send_mail() {
      const response = await fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
        })
      });
      const data = await response.json();
      return data;
    }

    send_mail().then(result => {
      console.log(result);
      load_mailbox('sent');
    });

    return false;
  }

}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-inside-view').style.display = 'none';

  document.querySelector('#inbox-view').style.display = 'none';
  document.querySelector('#sent-view').style.display = 'none';
  document.querySelector('#archive-view').style.display = 'none';

  document.querySelector(`#${mailbox}-view`).style.display = 'block';

  document.querySelector(`#${mailbox}-view-body`).innerHTML = '';
  document.querySelector(`#${mailbox}-view-heading`).innerHTML = '';

  // Show the mailbox name
  document.querySelector(`#${mailbox}-view-heading`).innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  let j;

  if (mailbox === 'inbox') {
    j = 0;
  } else if (mailbox === 'sent') {
    j = 1;
  } else {
    j = 2;
  }

  const email = [[], [], []];

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails.length);

        for (let i = 0; i < emails.length; i++) {
          const id = document.createElement('div');
          const mail_id = document.createElement('div');
          const subject = document.createElement('div');
          const timestamp = document.createElement('div');
          email[j][i] = document.createElement('div');
          mail_id.className = 'col-3';
          subject.className = 'col-6';
          timestamp.className = 'col-3';
          email[j][i].className = 'row border border-secondary';
          email[j][i].setAttribute("id", `email${j}${i}`);
          id.setAttribute("id", `id${j}${i}`);

          id.innerHTML = `${emails[i].id}`;
          if (mailbox === 'inbox') {
            mail_id.innerHTML = `<h5>${emails[i].sender}</h5>`;
          } else if (mailbox === 'sent') {
            mail_id.innerHTML = `<h5>${emails[i].recipients[0]}</h5>`;
          } else {
            mail_id.innerHTML = `<h5>${emails[i].sender}</h5>`;
          }
          subject.innerHTML = `${emails[i].subject}`;
          timestamp.innerHTML = `${emails[i].timestamp}`;

          document.querySelector(`#${mailbox}-view-body`).append(email[j][i]);

          if (mailbox === 'inbox') {
            if (emails[i].read === true) {
              document.querySelector(`#email${j}${i}`).style.setProperty('background', '#696969');
            }
          }
          document.querySelector(`#email${j}${i}`).append(id, mail_id, subject, timestamp);

          document.querySelector(`#id${j}${i}`).style.display = 'none';

          email[j][i].addEventListener('click', function () {
            console.log(`${j},${i}`);
            console.log('This element has been clicked!');

            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'none';

            document.querySelector('#mail-inside-view').style.display = 'block';

            const email_id = this.childNodes.item('id').innerHTML;

            fetch(`/emails/${email_id}`)
              .then(response => response.json())
              .then(email => {
                // Print email
                console.log(email);

                // ... do something else with email ...
                document.querySelector('#from').innerHTML = `<h5>From:</h5>${email.sender}`;
                document.querySelector('#to').innerHTML = `<h5>To:</h5>${email.recipients}`;
                document.querySelector('#subject').innerHTML = `<h5>Subject:</h5>${email.subject}`;
                document.querySelector('#timestamp').innerHTML = `<h5>Timestamp:</h5>${email.timestamp}`;
                document.querySelector('#mail-body').innerHTML = `${email.body}`;


                if (mailbox === 'inbox') {
                  fetch(`/emails/${email_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                      read: true
                    })
                  })
                  this.style.setProperty('background', '#696969');

                  const archive = document.querySelector('#archive_unarchive');
                  archive.innerHTML = `<button class="btn btn-sm btn-outline-success" id="archive_button">Archive</button>`;

                  document.querySelector('#archive_button').addEventListener('click', () => {

                    async function archive_mail() {
                      const response = await fetch(`/emails/${email_id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                          archived: true
                        })
                      })
                      const data = await response.json();
                      return data;
                    }

                    archive_mail().then(result => {
                      console.log(result);
                      load_mailbox('inbox');
                    });
                  });

                }


                if (mailbox === 'archive') {
                  const unarchive = document.querySelector('#archive_unarchive');
                  unarchive.innerHTML = `<button class="btn btn-sm btn-outline-success" id="unarchive_button">Unarchive</button>`;
                  document.querySelector('#unarchive_button').addEventListener('click', () => {

                    async function unarchive_mail() {
                      const response = await fetch(`/emails/${email_id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                          archived: false
                        })
                      })
                      const data = await response.json();
                      return data;
                    }

                    unarchive_mail().then(result => {
                      console.log(result);
                      load_mailbox('inbox');
                    });
                  });
                }

                document.querySelector('#reply').addEventListener('click', () => {
                  const reply = true;
                  compose_email(reply, email)
                });
              });
          });
        }

    });
}

