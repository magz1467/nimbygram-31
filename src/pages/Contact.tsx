import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="contact-page">
      <div className="container">
        <h1>Contact Us</h1>
        <p>
          We'd love to hear from you! Please use the form below to get in touch with our team.
        </p>
        
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows={5} required></textarea>
          </div>
          
          <button type="submit" className="submit-button">Send Message</button>
        </form>
        
        <div className="contact-info">
          <h2>Other Ways to Reach Us</h2>
          
          <div className="info-item">
            <h3>Email</h3>
            <p>info@nimbygram.com</p>
          </div>
          
          <div className="info-item">
            <h3>Phone</h3>
            <p>+44 (0) 123 456 7890</p>
          </div>
          
          <div className="info-item">
            <h3>Address</h3>
            <p>
              NimbyGram HQ<br />
              123 Tech Street<br />
              London, EC1A 1BB<br />
              United Kingdom
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;