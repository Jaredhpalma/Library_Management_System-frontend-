"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Book {
  id?: number;
  title: string;
  description: string;
  author: string;
  publisher: string;
  available_copies?: number;
}

const Dashboard = () => {
  const { authToken, user, isLoading } = useAppContext();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Book>({
    title: "",
    description: "",
    author: "",
    publisher: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoading && !authToken) {
      toast.error("Please login to access dashboard");
      router.push("/auth");
      return;
    }

    if (authToken && user?.role === 'admin') {
      router.push("/admin/dashboard");
      return;
    }

    if (authToken) {
      fetchAllBooks();
    }
  }, [authToken, isLoading, user, router]);

  const fetchAllBooks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/books`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setBooks(response.data.books || []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast.error("Failed to load books");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (isEdit && formData.id) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/books/${formData.id}`,
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success("Book updated successfully");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books`,
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success("Book added successfully");
      }
      resetForm();
      await fetchAllBooks();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Failed to save book");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Delete",
        text: "Are you sure you want to delete this book?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
      });

      if (result.isConfirmed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        toast.success("Book deleted successfully");
        await fetchAllBooks();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete book");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      author: "",
      publisher: ""
    });
    setIsEdit(false);
  };

  if (isLoading || !authToken) {
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
      <h2 className="mb-4">Book Management</h2>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h4>{isEdit ? "Edit Book" : "Add New Book"}</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Author</label>
                  <input
                    className="form-control"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Publisher</label>
                  <input
                    className="form-control"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <button 
                  className="btn btn-primary me-2" 
                  type="submit"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    isEdit ? "Update Book" : "Add Book"
                  )}
                </button>
                {isEdit && (
                  <button 
                    className="btn btn-secondary" 
                    type="button" 
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Available Books</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Publisher</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => (
                      <tr key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.publisher}</td>
                        <td>{book.description}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => {
                              setFormData(book);
                              setIsEdit(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => book.id && handleDelete(book.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {books.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center">No books available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
