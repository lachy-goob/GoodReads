// src/popup.tsx
import React, { useState, useEffect } from "react";

type Book = {
  title: string;
  shelf: "read" | "currently-reading" | "want-to-read";
};

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "read" | "currently-reading" | "want-to-read"
  >("read");
  const [books, setBooks] = useState<Book[]>([]);

  // On mount, load the stored books from chrome storage.
  useEffect(() => {
    chrome.storage.local.get("books", (result) => {
      if (result.books) {
        setBooks(
          result.books.map((book: { title: string; shelf: string }) => ({
            title: book.title,
            shelf: book.shelf as "read" | "currently-reading" | "want-to-read",
          }))
        );
      }
    });
  }, []);

  // Handler to refresh books via background messaging.
  const refreshBooks = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      if (tabId !== undefined) {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ["contentScript.js"],
          },
          () => {
            // After injection, re-fetch books from storage
            chrome.storage.local.get("books", (result) => {
              if (result.books) {
                setBooks(result.books);
              }
            });
          }
        );
      }
    });
  };

  const filteredBooks = books.filter((book) => book.shelf === activeTab);

  return (
    <div
      style={{
        padding: "10px",
        width: "300px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "18px", marginBottom: "10px" }}>
        My Goodreads Library
      </h1>
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("read")}
          style={{ marginRight: "5px" }}
        >
          Read
        </button>
        <button
          onClick={() => setActiveTab("currently-reading")}
          style={{ marginRight: "5px" }}
        >
          Currently Reading
        </button>
        <button onClick={() => setActiveTab("want-to-read")}>
          Want to Read
        </button>
        <button onClick={refreshBooks} style={{ marginBottom: "10px" }}>
          Refresh
        </button>
      </div>
      <div>
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, idx) => (
            <div
              key={idx}
              style={{ padding: "5px 0", borderBottom: "1px solid #ccc" }}
            >
              {book.title}
            </div>
          ))
        ) : (
          <div>No books found.</div>
        )}
      </div>
    </div>
  );
};

export default Popup;
