/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import { API } from "../../../api/endpoints";
import { PlusCircle, X, Pencil, Trash2 } from "lucide-react";

const Categories = () => {

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const [form, setForm] = useState({ categoryName: "", id: '' });
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModalOpen(false);
        setEditMode(false);
      }
    };
    if (modalOpen) document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, [modalOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get(API.CATEGORY.LIST);
      console.log("fetched categories = ", res?.data);
      setCategories(res?.data);
    } catch {
      alert("Unable to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setForm({ categoryName: "", id: "" });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    console.log("edit item = ", item);
    setForm({ categoryName: item.categoryName, id: item.id });
    setEditMode(true);
    setModalOpen(true);
    setDeleteConfirm(null);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await api.put(API.CATEGORY.UPDATE(form?.id), {
          categoryName: form.categoryName,
        });
      } else {
        await api.post(API.CATEGORY.CREATE, form);
      }

      setModalOpen(false);
      setEditMode(false);
      fetchCategories();
      setForm({ categoryName: "", id: "" });
    } catch {
      alert("Failed to save category");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(API.CATEGORY.DELETE(deleteConfirm.id));
      setDeleteConfirm(null);
      fetchCategories();
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-primary-navy">Categories</h1>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1 bg-secondary-gold text-primary-navy
                     px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:opacity-90"
        >
          <PlusCircle size={18} />
          Add Category
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <h2 className="text-lg font-medium text-primary-navy">
              {cat.categoryName}
            </h2>

            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={() => openEditModal({ ...cat, id: cat.id })}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={() => setDeleteConfirm(cat)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- MODAL (CREATE / EDIT) ---------------- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary-navy">
                {editMode ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="text-gray-600 hover:text-black" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Category Name"
              value={form.categoryName}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryName: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4
                         focus:outline-none focus:ring-1 focus:ring-primary-navy"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-sm rounded bg-primary-navy text-white hover:bg-primary-navy-light"
              >
                {editMode ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRM ---------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-xs shadow-lg">
            <h3 className="text-primary-navy font-semibold text-lg mb-2">
              Delete Category?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteConfirm.categoryName}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------- END DELETE CONFIRM ---------------- */}
    </div>
  );
};

export default Categories;
