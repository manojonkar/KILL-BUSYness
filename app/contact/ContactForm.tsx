import { sendContactMessage } from "./actions";

export default function ContactForm() {
  return (
    <form action={sendContactMessage} className="form-grid">
      <div className="field">
        <label>Name</label>
        <input name="name" placeholder="Your name" required />
      </div>
      <div className="field">
        <label>Email</label>
        <input name="email" type="email" placeholder="you@company.com" required />
      </div>
      <div className="field full">
        <label>Message</label>
        <textarea name="message" rows={5} placeholder="What would you like to talk about?" required />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16, gridColumn: "1/-1" }} type="submit">
        Send
      </button>
    </form>
  );
}
