'use client';

import { useRouter } from 'next/navigation';
import '../Idea.css';

import React, { useState } from 'react';

export default function Invite() {
    const router = useRouter();
    const [emails, setEmails] = useState(['']);

    const handleSubmit = () => {
        // TO DO: Implement Backend call to send emails (liekly with Brevo or email.js)
    };

    const navigateNext = () => {
      router.push('/voting');
    };

    function addEmail() {
        setEmails([...emails, '']);
    }

    function removeEmail() {
        const newEmails = [...emails];
        newEmails.pop();
        setEmails(newEmails);
    }

    function EmailForm() {
      return (
          <div>
            <div className="Idea-vert">
              {emails.map((email, i) => (
                <div key={i}>
                  <EmailBox i={i} curEmail={emails[i]} />
                </div>
              ))}
              {emails.length <= 10 && <button className="Idea-button Idea-vert-item" onClick={addEmail} type="button">
                Add Email
                                      </button>}
              {emails.length > 1 && <button className="Idea-button Idea-vert-item" onClick={removeEmail} type="button">
                Remove Email
                                    </button>}
              <button className="Idea-button Idea-vert-item" type="submit" onClick={navigateNext} >Send Invites</button>
            </div>
            <QRCodeButton />
          </div>
      );
    }

    function QRCodeButton() {
        const [isQRCode, setIsQRCode] = useState(false);

        function switchOn() {
            setIsQRCode(true);
        }

        return !isQRCode ?
            (<button className="Idea-button Idea-vert-item" type="button" onClick={switchOn}>Generate QR Code</button>) :
            (<img src="https://api.qrserver.com/v1/create-qr-code/?data=https%3A%2F%2Fsushigo.netlify.app%2F&size=[200]x[200]" alt="qr code" />);
    }

    function EmailBox({ i, curEmail }) {
        i = parseInt(i, 10);
        const [email, setEmail] = useState(curEmail);

        const changeEmail = (e: { target: { value: string; }; }) => {
            setEmail(e.target.value);
            const newEmails = emails;
            newEmails[i] = e.target.value;
            setEmails(newEmails);
        };

        return (
            <>
              <div className="Idea-vert Idea-vert-item">
                  <label className="Idea-label">Email</label>
                  <input type="text" className="Idea-text" name="email" value={email} onChange={changeEmail} />
              </div>
            </>
        );
    }

    return (
        <div className="Idea">
          <header className="Idea-header">
            <nav>
              <p><strong>Invite Collaborators</strong></p>
            </nav>
          </header>
          <EmailForm />
        </div>
      );
}
