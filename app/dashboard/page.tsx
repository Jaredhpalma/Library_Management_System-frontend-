"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Transaction {
  id: number;
  book_id: number;
  user_id: number;
  borrowed_date: string;
  due_date: string;
  returned_date: string | null;
  status: 'borrowed' | 'returned';
  book: {
    title: string;
    author: string;
  };
  user: {
    name: string;
    email: string;
  };
}

interface DashboardStats {
  books_count: number;
  users_count: number;
  transactions_count: number;
  overdue_count: number;
  recent_transactions: {
    id: number;
    user_name: string;
    book_title: string;
    borrowed_date: string;
    due_date: string;
    status: string;
  }[];
}

const AdminDashboard = () => {
  const { authToken, user, isLoading } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "books" | "users" | "transactions">("dashboard");
  const [loading, setLoading] = useState({
    dashboard: false,
    books: false,
    users: false,
    transactions: false,
    action: false
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    books: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    users: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    transactions: { current_page: 1, last_page: 1, per_page: 10, total: 0 }
  });
  const [searchTerm, setSearchTerm] = useState({
    books: "",
    users: "",
    transactions: ""
  });
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    total_copies: 1
  });

  useEffect(() => {
    if (!isLoading) {
      if (!authToken) {
        router.push("/auth");
      } else if (user?.role !== 'admin') {
        router.push("/");
      }
    }
  }, [authToken, isLoading, router, user]);

  useEffect(() => {
    if (authToken && user?.role === 'admin') {
      fetchDashboardStats();
    }
  }, [authToken, user]);

  useEffect(() => {
    if (authToken && user?.role === 'admin') {
      switch (activeTab) {
        case "dashboard":
          fetchDashboardStats();
          break;
        case "books":
          fetchBooks();
          break;
        case "users":
          fetchUsers();
          break;
        case "transactions":
          fetchTransactions();
          break;
      }
    }
  }, [activeTab, authToken, user]);

  const fetchDashboardStats = async () => {
    setLoading(prev => ({...prev, dashboard: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard-stats`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Dashboard stats fetch error:', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to load dashboard statistics"
      );
    } finally {
      setLoading(prev => ({...prev, dashboard: false}));
    }
  };

  const fetchBooks = async (page = 1, search = "") => {
    setLoading(prev => ({...prev, books: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/books`,
        {
          params: {
            page,
            search: search || undefined,
            per_page: pagination.books.per_page
          },
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      
      setBooks(response.data.data);
      setPagination(prev => ({
        ...prev,
        books: {
          current_page: page,
          last_page: response.data.meta?.last_page || 1,
          per_page: response.data.meta?.per_page || 10,
          total: response.data.meta?.total || 0
        }
      }));
    } catch (error: any) {
      console.error('Books fetch error:', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to load books"
      );
    } finally {
      setLoading(prev => ({...prev, books: false}));
    }
  };

  const fetchUsers = async (page = 1, search = "") => {
    setLoading(prev => ({...prev, users: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          params: {
            page,
            search: search || undefined,
            per_page: pagination.users.per_page
          },
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      
      setUsers(response.data.data);
      setPagination(prev => ({
        ...prev,
        users: {
          current_page: page,
          last_page: response.data.meta?.last_page || 1,
          per_page: response.data.meta?.per_page || 10,
          total: response.data.meta?.total || 0
        }
      }));
    } catch (error: any) {
      console.error('Users fetch error:', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to load users"
      );
    } finally {
      setLoading(prev => ({...prev, users: false}));
    }
  };

  const fetchTransactions = async (page = 1, search = "") => {
    setLoading(prev => ({...prev, transactions: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions`,
        {
          params: {
            page,
            search: search || undefined,
            per_page: pagination.transactions.per_page
          },
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      
      setTransactions(response.data.data);
      setPagination(prev => ({
        ...prev,
        transactions: {
          current_page: page,
          last_page: response.data.meta?.last_page || 1,
          per_page: response.data.meta?.per_page || 10,
          total: response.data.meta?.total || 0
        }
      }));
    } catch (error: any) {
      console.error('Transactions fetch error:', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to load transactions"
      );
    } finally {
      setLoading(prev => ({...prev, transactions: false}));
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({...prev, action: true}));
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/books`,
        {
          ...newBook,
          available_copies: newBook.total_copies
        },
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      
      setBooks(prev => [...prev, response.data.data]);
      setShowAddBookModal(false);
      setNewBook({
        title: "",
        author: "",  
        genre: "",
        description: "",
        total_copies: 1
      });
      
      toast.success("Book added successfully");
    } catch (error: any) {
      console.error('Add book error:', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to add book"
      );
    } finally {
      setLoading(prev => ({...prev, action: false}));
    }
  };

  const handleUpdateBook = async (bookId: number, bookData: Partial<Book>) => {
    setLoading(prev => ({...prev, action: true}));
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/books/${bookId}`,
        bookData,
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      
      toast.success("Book updated successfully");
      fetchBooks();
      setShowEditBookModal(false);
    } catch (error: any) {
      console.error('Update book error:', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to update book"
      );
    } finally {
      setLoading(prev => ({...prev, action: false}));
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        setLoading(prev => ({...prev, action: true}));
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/books/${bookId}`,
          { 
            headers: { 
              Authorization: `Bearer ${authToken}`,
              Accept: 'application/json'
            }
          }
        );
        
        setBooks(prev => prev.filter(book => book.id !== bookId));
        toast.success("Book deleted successfully");
      }
    } catch (error: any) {
      console.error('Delete book error:', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to delete book"
      );
    } finally {
      setLoading(prev => ({...prev, action: false}));
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

  if (isLoading || !authToken || user?.role !== 'admin') {
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
            disabled={loading.dashboard}
          >
            Dashboard
            {loading.dashboard && (
              <span className="spinner-border spinner-border-sm ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "books" ? "active" : ""}`}
            onClick={() => setActiveTab("books")}
            disabled={loading.books}
          >
            Books
            {loading.books && (
              <span className="spinner-border spinner-border-sm ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
            disabled={loading.users}
          >
            Users
            {loading.users && (
              <span className="spinner-border spinner-border-sm ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
            disabled={loading.transactions}
          >
            Transactions
            {loading.transactions && (
              <span className="spinner-border spinner-border-sm ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
          </button>
        </li>
      </ul>

      {activeTab === "dashboard" ? (
        <div>
          {loading.dashboard ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : stats ? (
            <div>
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card text-white bg-primary mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Total Books</h5>
                      <p className="card-text display-4">{stats.books_count}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-white bg-success mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Total Users</h5>
                      <p className="card-text display-4">{stats.users_count}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-white bg-info mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Active Borrows</h5>
                      <p className="card-text display-4">{stats.transactions_count}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-white bg-danger mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Overdue</h5>
                      <p className="card-text display-4">{stats.overdue_count}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h5>Recent Transactions</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Book</th>
                          <th>Borrowed Date</th>
                          <th>Due Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent_transactions.map(tx => (
                          <tr key={tx.id}>
                            <td>{tx.user_name}</td>
                            <td>{tx.book_title}</td>
                            <td>{formatDate(tx.borrowed_date)}</td>
                            <td>{formatDate(tx.due_date)}</td>
                            <td>
                              <span className={`badge ${tx.status === 'overdue' ? 'bg-danger' : 'bg-success'}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">Failed to load dashboard data</div>
          )}
        </div>
      ) : activeTab === "books" ? (
        <div>
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search books..."
                  value={searchTerm.books}
                  onChange={(e) => {
                    setSearchTerm(prev => ({...prev, books: e.target.value}));
                    fetchBooks(1, e.target.value);
                  }}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => fetchBooks(1, searchTerm.books)}>
                  Search
                </button>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddBookModal(true)}
              >
                Add New Book
              </button>
            </div>
          </div>

          {loading.books ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="alert alert-info">No books found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Description</th>
                    <th>Total Copies</th>
                    <th>Available Copies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre}</td>
                      <td>{book.description}</td>
                      <td>{book.total_copies}</td>
                      <td>{book.available_copies}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              setCurrentBook(book);
                              setShowEditBookModal(true);
                            }}
                            disabled={loading.action}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={loading.action}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {books.length > 0 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.books.current_page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => fetchBooks(pagination.books.current_page - 1, searchTerm.books)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({length: pagination.books.last_page}, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${pagination.books.current_page === page ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => fetchBooks(page, searchTerm.books)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.books.current_page === pagination.books.last_page ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => fetchBooks(pagination.books.current_page + 1, searchTerm.books)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      ) : activeTab === "users" ? (
        <div>
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={searchTerm.users}
                  onChange={(e) => {
                    setSearchTerm(prev => ({...prev, users: e.target.value}));
                    fetchUsers(1, e.target.value);
                  }}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => fetchUsers(1, searchTerm.users)}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {loading.users ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="alert alert-info">No users found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {users.length > 0 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.users.current_page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => fetchUsers(pagination.users.current_page - 1, searchTerm.users)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({length: pagination.users.last_page}, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${pagination.users.current_page === page ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => fetchUsers(page, searchTerm.users)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.users.current_page === pagination.users.last_page ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => fetchUsers(pagination.users.current_page + 1, searchTerm.users)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      ) : (
        <div>
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search transactions..."
                  value={searchTerm.transactions}
                  onChange={(e) => {
                    setSearchTerm(prev => ({...prev, transactions: e.target.value}));
                    fetchTransactions(1, e.target.value);
                  }}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => fetchTransactions(1, searchTerm.transactions)}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {loading.transactions ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="alert alert-info">No transactions found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Book</th>
                    <th>Borrowed Date</th>
                    <th>Due Date</th>
                    <th>Returned Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.user.name}</td>
                      <td>{tx.book.title} by {tx.book.author}</td>
                      <td>{formatDate(tx.borrowed_date)}</td>
                      <td>{formatDate(tx.due_date)}</td>
                      <td>{tx.returned_date ? formatDate(tx.returned_date) : 'Not returned yet'}</td>
                      <td>
                        <span className={`badge ${tx.status === 'borrowed' ? 'bg-warning' : 'bg-success'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {transactions.length > 0 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.transactions.current_page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => fetchTransactions(pagination.transactions.current_page - 1, searchTerm.transactions)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({length: pagination.transactions.last_page}, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${pagination.transactions.current_page === page ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => fetchTransactions(page, searchTerm.transactions)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.transactions.current_page === pagination.transactions.last_page ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => fetchTransactions(pagination.transactions.current_page + 1, searchTerm.transactions)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="modal show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Book</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddBookModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddBook}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="title" 
                      required 
                      value={newBook.title}
                      onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="author" className="form-label">Author</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="author" 
                      required 
                      value={newBook.author}
                      onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="genre" className="form-label">Genre</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="genre" 
                      required 
                      value={newBook.genre}
                      onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      id="description" 
                      rows={3}
                      value={newBook.description}
                      onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="totalCopies" className="form-label">Total Copies</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="totalCopies" 
                      min="1" 
                      required 
                      value={newBook.total_copies}
                      onChange={(e) => setNewBook({...newBook, total_copies: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddBookModal(false)}>Close</button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading.action}
                    >
                      {loading.action ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding...
                        </>
                      ) : 'Add Book'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditBookModal && currentBook && (
        <div className="modal show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Book</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditBookModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="editTitle" className="form-label">Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="editTitle" 
                      required 
                      defaultValue={currentBook.title}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editAuthor" className="form-label">Author</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="editAuthor" 
                      required 
                      defaultValue={currentBook.author}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editGenre" className="form-label">Genre</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="editGenre" 
                      required 
                      defaultValue={currentBook.genre}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editDescription" className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      id="editDescription" 
                      rows={3}
                      defaultValue={currentBook.description}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editTotalCopies" className="form-label">Total Copies</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="editTotalCopies" 
                      min="1" 
                      required 
                      defaultValue={currentBook.total_copies}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditBookModal(false)}>Close</button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        const formData = {
                          title: (document.getElementById('editTitle') as HTMLInputElement).value,
                          author: (document.getElementById('editAuthor') as HTMLInputElement).value,
                          genre: (document.getElementById('editGenre') as HTMLInputElement).value,
                          description: (document.getElementById('editDescription') as HTMLTextAreaElement).value,
                          total_copies: parseInt((document.getElementById('editTotalCopies') as HTMLInputElement).value)
                        };
                        
                        handleUpdateBook(currentBook.id, formData);
                      }}
                      disabled={loading.action}
                    >
                      {loading.action ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : 'Update Book'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;