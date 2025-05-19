"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useAppContext } from '@/context/AppProvider';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  publisher: string;
}

interface BookManagementProps {
  books: Book[];
  onRefresh: () => void;
}

const BookManagement = ({ books, onRefresh }: BookManagementProps) => {
  const { authToken } = useAppContext();
  const [isEditing, setIsEditing] = useState<Book | null>(null);
  const [formData, setFormData] = useState<Omit<Book, 'id'>>({
    title: '',
    author: '',
    description: '',
    publisher: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (isEditing) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/books/${isEditing.id}`,
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('Book updated successfully!');
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/books`,
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('Book added successfully!');
      }
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save book');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Delete',
        text: "Are you sure you want to delete this book?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
      });

      if (result.isConfirmed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/books/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        toast.success('Book deleted successfully!');
        onRefresh();
      }
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      publisher: ''
    });
    setIsEditing(null);
  };

  return (
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header">
            <h4>{isEditing ? "Edit Book" : "Add New Book"}</h4>
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
                  isEditing ? "Update Book" : "Add Book"
                )}
              </button>
              {isEditing && (
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
            <h4>Book List</h4>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.publisher}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => {
                            setFormData({
                              title: book.title,
                              author: book.author,
                              publisher: book.publisher,
                              description: book.description
                            });
                            setIsEditing(book);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(book.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookManagement;