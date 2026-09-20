"use client";

import React, { useRef, useEffect, useState } from "react";

const REVIEWS = [
  { text: "This is a book every business owner and senior leader should read. Kill BUSYness challenges one of the biggest traps in organizations today - mistaking constant activity for real progress. Manoj Onkar makes you reflect on an uncomfortable but important question, how much of what we call 'work' actually creates value? The insights are practical, thought-provoking, and highly relevant for leaders who want to move their organizations from endless firefighting and meetings to clarity, focus, and meaningful results. The interesting part is there is an activity chart after each section. If you are responsible for growing a business, leading people, or shaping the future of an organization, this book could make you rethink how you and your teams spend your most valuable resource: time. A compelling read for leaders who want to achieve more, not by doing more, but by focusing on what truly matters.", author: "Manoj Mani" },
  { text: "KILL BUSYness is a sharp, thought-provoking book that goes straight to a problem many organizations quietly accept: activity without real progress. Manoj Onkar has a clear and courageous voice, and the book makes an important point — being busy is not the same as being effective. What I liked most is how the book challenges leaders to look beyond surface-level motion and examine the standards, habits, and systems that create busyness in the first place. The ROAR framework is practical and memorable, and the overall message feels grounded in real organizational experience. The book is especially useful for leaders who want higher performance, stronger accountability, and a healthier way of working. Since I know Manoj personally, I can say this reflects the same depth of thinking and commitment he brings to his work. It is a valuable read for anyone serious about building an organization that performs with purpose, not just pace.", author: "Amit Banerjee" },
  { text: "This book is easily the Bhagawad Gita or the Bible of transforming any Institution or organisation into an extraordinary one: one that is future-ready, where each team member brings his/her head, heart, and soul fully into their work, and the very existence or purpose of the org or institution is a positive impact on society. I recommend a first, quick reading of the whole book, and then slow and systematic study of it multiple times and trying implementation of the ideas and exercises suggested in their organisation. Happy reading! I am sure it will be highly engaging and rewarding.", author: "Prof Ramakrishnan A G, Org Dev Consultant, IIIT Dharwad, & Adjunct Faculty, IIT Hyderabad" },
  { text: "Don't be so Busy in your Life and Miss this Masterclass Book by Manojji Onkar, I just realised that how we reason everything in our life by Busyness and Compromise our Productivity, Purpose, Leadership, Organisation Growth. Busyness is created at the top, Normalised at Middle and Suffered at Bottom. This is for all the conscious leaders those who are really looking to make a difference in their organisation and on this Planet. Killing the Business is the only Matrix to develop a performance architecture for your organisation. I wish all the best and congratulations for all the readers for taking the decision to buy this book. I am totally amazed how reality is mirrored in the book and where are we lacking as Leader.", author: "Adesh Gothi, Founder & CEO" },
  { text: "My biggest takeaway is very simple: first kill busyness, then you can really build your business. It created a new reality. Reinventing Management and No Follow-Up Required completely changed my thinking. No Follow-Up Required is a powerful idea. Now my focus is not on chasing people, but creating an ecosystem where everyone performs.", author: "Nilesh Surana, CEO" },
  { text: "A must-read book for every CEO who wants to take their organisation from being busy and constantly firefighting to building a clear path towards sustainable growth.", author: "Decorviona" },
  { text: "Very good book on Management. Points are direct and doesn't beat around bushes with lengthy paragraph. I would recommend this book to all who want to build extraordinary organization with focus on growth and a culture where every employee feel motivated to deliver results.", author: "Saravanan" },
  { text: "Very Important.", author: "Pranav Kapadia" },
  { text: "Great Book. Must Read. It is practical, hands on coaching that will help all leaders to transform their organization. Identify the BUSYness that is killing their business and move to become a HPO - High Performance Organization.", author: "SHRIKANT" },
  { text: "This is a brilliant book. While the central idea is simple; that Busyness is a pandemic that is effecting a lot of leaders, which in turn has an impact on the Businesses / Organisations that the leader is leading. The author also shares frameworks for diagnosing 'Busyness' as well as a framework for curing the 'Busyness'. In my view, it is an extremely insightful book that addresses common leadership blindspots and has a framework of useful tools that can be used by any leader for their organisation. Strongly recommended.", author: "Chetan Khosla, CMD" },
  { text: "BUSYness is not a time-management problem. It is a leadership fault, created at the top and paid for further down, with a lag. That single reframe is what the book is for. The most useful section is the one on follow-up. If your organisation needs chasing to move, the book names the condition and gives you a standard to put in its place. I tested one rule from it. No second screen in any meeting that mattered. Within two days it told me something uncomfortable: several meetings I routinely attend do not deserve anyone's full attention, including mine. Read it if your calendar is full and you cannot say what moved this week. If you are early and still, correctly, chasing many things at once, parts of it will read as a verdict before its time.", author: "Utpal Vaishnav, Founder & Chairman" }
];

export default function TestimonialsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft <= 20) {
        // Go to the very end
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: -(clientWidth + 24), behavior: "smooth" });
      }
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // If we are essentially at the end of the scrollable area, rewind to start
      if (scrollLeft + clientWidth >= scrollWidth - 30) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: clientWidth + 24, behavior: "smooth" });
      }
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      scrollRight();
    }, 4500); // Advances every 4.5 seconds
    
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section 
      style={{ backgroundColor: "#f9fafb", padding: "60px 44px", overflow: "hidden", position: "relative" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <style>{`
        .testimonials-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .slider-controls {
          display: flex;
          gap: 12px;
        }
        .slider-controls.bottom {
          justify-content: center;
          margin-top: 20px;
        }
        .slider-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .slider-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        .slider-container {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          gap: 24px;
          padding-bottom: 20px;
          max-width: 1200px;
          margin: 0 auto;
          scrollbar-width: none;
        }
        .slider-container::-webkit-scrollbar {
          display: none;
        }
        .testimonial-card {
          flex: 0 0 calc(50% - 12px);
          scroll-snap-align: start;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          height: auto;
        }
        @media (max-width: 768px) {
          .testimonial-card {
            flex: 0 0 100%;
          }
        }
      `}</style>

      <div className="testimonials-header">
        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", margin: 0 }}>
          What Readers Are Saying
        </h2>
        <div className="slider-controls">
          <button onClick={scrollLeft} className="slider-btn" aria-label="Previous reviews">
            &larr;
          </button>
          <button onClick={scrollRight} className="slider-btn" aria-label="Next reviews">
            &rarr;
          </button>
        </div>
      </div>

      <div className="slider-container" ref={scrollRef}>
        {REVIEWS.map((review, i) => (
          <div key={i} className="testimonial-card">
            <div>
              <div style={{ color: "#f59e0b", fontSize: "1.2rem", marginBottom: "12px" }}>★★★★★</div>
              <p style={{ marginBottom: "16px", lineHeight: "1.5" }}>
                "{review.text}"
              </p>
            </div>
            {review.author && (
              <div style={{ fontWeight: "600", fontSize: "0.9rem", marginTop: "auto" }}>
                — {review.author}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="slider-controls bottom">
        <button onClick={scrollLeft} className="slider-btn" aria-label="Previous reviews">
          &larr;
        </button>
        <button onClick={scrollRight} className="slider-btn" aria-label="Next reviews">
          &rarr;
        </button>
      </div>
    </section>
  );
}
