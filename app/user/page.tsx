"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  publisher: string;
  available_copies: number;
  total_copies: number;
  borrowed_at?: string;
  due_date?: string;
  added_by?: string;
  user?: {
    name: string;
  };
  transaction_id: number;
  unique_key?: string;
  status?: string;
}

const UserDashboard = () => {
  const { authToken, user, isLoading } = useAppContext();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "available" | "borrowed">("all");
  const [loading, setLoading] = useState({
    books: false,
    borrowed: false,
    action: false,
    refreshing: false
  });
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchBooks();
      fetchBorrowedBooks();
    }
  }, [authToken]);

  const fetchBooks = async () => {
    setLoading(prev => ({...prev, books: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.books ? response.data.books : 
                  response.data.data ? response.data.data : [];
      
      const formattedBooks = data.map((book: any) => ({
        id: book.id,
        title: book.title || 'No Title',
        author: book.author || 'Unknown Author',
        description: book.description || 'No description available',
        publisher: book.publisher || 'Unknown Publisher',
        available_copies: book.available_copies || 0,
        total_copies: book.total_copies || 0,
        added_by: book.user?.name || 'Admin'
      }));
      
      setBooks(formattedBooks);
    } catch (error: any) {
      console.error('Book fetch error:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to load books"
      );
    } finally {
      setLoading(prev => ({...prev, books: false}));
    }
  };

  const fetchBorrowedBooks = async () => {
    setLoading(prev => ({...prev, borrowed: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/borrowed-books`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.books ? response.data.books : 
                  response.data.data ? response.data.data : [];
      
      const formattedBooks = data.map((book: any, index: number) => ({
        id: book.id,
        title: book.title || 'No Title',
        author: book.author || 'Unknown Author',
        publisher: book.publisher || 'Unknown Publisher',
        borrowed_at: book.borrowed_at || book.borrowed_date,
        due_date: book.due_date,
        available_copies: book.available_copies || 0,
        total_copies: book.total_copies || 0,
        transaction_id: book.transaction_id || book.id,
        status: book.status || 'borrowed',
        unique_key: `${book.id}-${book.transaction_id || index}-${Date.now()}`
      }));
      
      setBorrowedBooks(formattedBooks);
    } catch (error: any) {
      console.error('Borrowed books fetch error:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to load borrowed books"
      );
    } finally {
      setLoading(prev => ({...prev, borrowed: false}));
    }
  };

  const refreshData = async () => {
    setLoading(prev => ({...prev, refreshing: true}));
    try {
      await Promise.all([fetchBooks(), fetchBorrowedBooks()]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(prev => ({...prev, refreshing: false}));
    }
  };

  const handleBorrow = async (bookId: number) => {
    if (!dueDate) {
      toast.error("Please select a return date");
      return;
    }

    const today = new Date();
    const maxDueDate = new Date();
    maxDueDate.setDate(today.getDate() + 7);

    if (dueDate > maxDueDate) {
      toast.error("Maximum borrowing period is 1 week");
      return;
    }

    if (dueDate < today) {
      toast.error("Return date cannot be in the past");
      return;
    }

    setLoading(prev => ({...prev, action: true}));
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/borrow`,
        { due_date: dueDate.toISOString().split('T')[0] },
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      
      toast.success(response.data?.message || "Book borrowed successfully");
      setDueDate(null);
      setSelectedBookId(null);
      await Promise.all([fetchBooks(), fetchBorrowedBooks()]);
    } catch (error: any) {
      console.error('Borrow error:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to borrow book"
      );
    } finally {
      setLoading(prev => ({...prev, action: false}));
    }
  };

  const handleReturn = async (transactionId: number, bookTitle: string) => {
    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Confirm Return",
        text: `Are you sure you want to return "${bookTitle}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, return it",
      });

      if (result.isConfirmed) {
        setLoading(prev => ({...prev, action: true}));
        
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}/return`,
            {},
            {
              headers: { 
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json'
              }
            }
          );

          if (response.data?.success) {
            toast.success(response.data.message || "Book returned successfully");
            await Promise.all([fetchBooks(), fetchBorrowedBooks()]);
          } else {
            throw new Error(response.data?.message || "Failed to process return");
          }
        } catch (error: any) {
          console.error('Return error:', error);
          let errorMessage = "Failed to return book";
          
          if (error.response) {
            if (error.response.status === 404) {
              errorMessage = "Transaction not found";
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
          }
          
          toast.error(errorMessage);
        } finally {
          setLoading(prev => ({...prev, action: false}));
        }
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error("An error occurred during confirmation");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isBookOverdue = (dueDateString?: string) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    return dueDate < new Date();
  };

  if (isLoading || !authToken || (user?.role === 'admin')) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const filteredBooks = activeTab === "available" 
    ? books.filter(book => book.available_copies > 0)
    : activeTab === "borrowed" 
      ? borrowedBooks 
      : books;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.name}</h2>
        <div className="d-flex align-items-center">
          <small className="text-muted me-3">
            Current time: {lastUpdated}
          </small>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={refreshData}
            disabled={loading.refreshing}
          >
            {loading.refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Refreshing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            disabled={loading.books || loading.borrowed}
          >
            All Books
            {loading.books && (
              <span className="spinner-border spinner-border-sm ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "available" ? "active" : ""}`}
            onClick={() => setActiveTab("available")}
            disabled={loading.books || loading.borrowed}
          >
            Available Books
            {loading.books && (
              <span className="spinner-border spinner-border-sm ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "borrowed" ? "active" : ""}`}
            onClick={() => setActiveTab("borrowed")}
            disabled={loading.books || loading.borrowed}
          >
            My Borrowed Books
            {loading.borrowed && (
              <span className="spinner-border spinner-border-sm ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
          </button>
        </li>
      </ul>

      {activeTab !== "borrowed" ? (
        <div className="row">
          {filteredBooks.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">
                {loading.books ? "Loading books..." : "No books found."}
              </div>
            </div>
          ) : (
            filteredBooks.map(book => (
              <div key={`book-${book.id}`} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{book.title}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">by {book.author}</h6>
                    <p className="card-text flex-grow-1">{book.description}</p>
                    <p className="card-text">
                      <small className="text-muted">Publisher: {book.publisher}</small>
                    </p>
                    <p className="card-text">
                      <small className="text-muted">
                        Copies: {book.available_copies} available / {book.total_copies} total
                      </small>
                    </p>
                    {book.added_by && (
                      <p className="card-text">
                        <small className="text-muted">Added by: {book.added_by}</small>
                      </p>
                    )}
                  </div>
                  <div className="card-footer bg-transparent">
                    {selectedBookId === book.id ? (
                      <div className="mb-3">
                        <label className="form-label">Select return date (max 1 week)</label>
                        <DatePicker
                          selected={dueDate}
                          onChange={(date) => setDueDate(date)}
                          minDate={new Date()}
                          maxDate={new Date(new Date().setDate(new Date().getDate() + 7))}
                          className="form-control mb-2"
                          placeholderText="Select return date"
                          dateFormat="MMMM d, yyyy"
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary flex-grow-1"
                            onClick={() => handleBorrow(book.id)}
                            disabled={loading.action}
                          >
                            {loading.action ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                              </>
                            ) : (
                              'Confirm Borrow'
                            )}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setSelectedBookId(null);
                              setDueDate(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={`btn w-100 ${book.available_copies > 0 ? 'btn-primary' : 'btn-secondary disabled'}`}
                        onClick={() => book.available_copies > 0 && setSelectedBookId(book.id)}
                        disabled={book.available_copies <= 0 || loading.action}
                      >
                        {book.available_copies > 0 ? 'Borrow Book' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th>Borrowed Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {borrowedBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    {loading.borrowed ? "Loading borrowed books..." : "You haven't borrowed any books yet."}
                  </td>
                </tr>
              ) : (
                borrowedBooks.map(book => (
                  <tr key={book.unique_key}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publisher}</td>
                    <td>{formatDate(book.borrowed_at)}</td>
                    <td className={isBookOverdue(book.due_date) ? 'text-danger fw-bold' : ''}>
                      {formatDate(book.due_date)}
                      {isBookOverdue(book.due_date) && (
                        <span className="badge bg-danger ms-2">Overdue</span>
                      )}
                    </td>
                    <td>
                      {book.status === 'returned' ? (
                        <span className="badge bg-success">Returned</span>
                      ) : (
                        <span className="badge bg-primary">Borrowed</span>
                      )}
                    </td>
                    <td>
                      {book.status !== 'returned' ? (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleReturn(book.transaction_id, book.title)}
                          disabled={loading.action}
                        >
                          {loading.action ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Returning...
                            </>
                          ) : (
                            'Return Book'
                          )}
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-secondary" disabled>
                          Already Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;