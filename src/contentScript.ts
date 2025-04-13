function scrapeBooksFromGoodreads(): {
  title: string;
  author: string;
  shelf: string;
}[] {
  const rows = document.querySelectorAll("tr.bookalike.review");
  console.log(`🔍 Found ${rows.length} rows`);

  const books: { title: string; author: string; shelf: string }[] = [];

  rows.forEach((row, index) => {
    const titleAnchor = row.querySelector("td.field.title a");
    const authorAnchor = row.querySelector("td.field.author a");
    const shelfAnchor = row.querySelector("td.field.shelves a.shelfLink");

    if (!titleAnchor || !authorAnchor || !shelfAnchor) {
      console.warn(`⚠️ Skipping row ${index} - Missing data`, row);
      return;
    }

    const title = titleAnchor.textContent?.trim() || "";
    const author = authorAnchor.textContent?.trim() || "";
    const shelf =
      shelfAnchor.textContent?.trim().toLowerCase().replace(/\s+/g, "-") || "";

    books.push({ title, author, shelf });
  });

  return books;
}

// Scrape and store in chrome.storage
const books = scrapeBooksFromGoodreads();

if (books.length > 0) {
  const formattedBooks = books.map((book) => ({
    title: book.title,
    shelf: book.shelf as "read" | "currently-reading" | "want-to-read",
  }));

  chrome.storage.local.set({ books: formattedBooks }, () => {
    console.log("✅ Stored books:", formattedBooks);
  });
} else {
  console.warn("🚫 No books found. Check page structure or permissions.");
}
