import { useState, useEffect, useRef } from "react";
import { categoryApi } from "../api/categoryApi";
import { PlusCircle, X, Pencil, Trash2, Search, LayoutGrid, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Pagination } from "../../../shared/components/common";
import { Category } from "../types/category.types";

const Categories = () => {
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const [form, setForm] = useState<Category>({ categoryName: "", id: '' });
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
    setLoading(true);
    try {
      const response = await categoryApi.list({
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: searchQuery
      });

      // Handle response structure (paginated or flat array)
      if ('items' in response) {
        setCategories(response.items);
        setTotalCount(response.totalCount);
        setTotalPages(response.totalPages);
      } else {
        // Fallback if API returns array (should not happen with updated API mock)
        const items = response as Category[];
        setCategories(items);
        setTotalCount(items.length);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      toast.error(error.message || "Unable to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on search
      fetchCategories();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch when pagination changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage, pageSize]); // searchQuery is handled by debounce effect

  const openCreateModal = () => {
    setForm({ categoryName: "", id: "" });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEditModal = (item: Category) => {
    setForm({ categoryName: item.categoryName, id: item.id });
    setEditMode(true);
    setModalOpen(true);
    setDeleteConfirm(null);
  };

  const handleSave = async () => {
    if (!form.categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editMode) {
        await categoryApi.update(form.id, {
          categoryName: form.categoryName,
        });
        toast.success("Category updated successfully!");
      } else {
        await categoryApi.create(form);
        toast.success("Category created successfully!");
      }

      setModalOpen(false);
      setEditMode(false);
      fetchCategories();
      setForm({ categoryName: "", id: "" });
    } catch (error: any) {
      console.error("Failed to save category:", error);
      toast.error(error.message || "Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await categoryApi.delete(deleteConfirm.id);
      toast.success("Category deleted successfully!");
      setDeleteConfirm(null);
      fetchCategories();
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-primary-navy to-primary-navy-light rounded-lg text-white shadow-lg">
              <LayoutGrid size={24} />
            </span>
            Category Manager
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Organize specific content areas for your courses</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-navy transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none w-full sm:w-64 transition-all shadow-sm group-hover:shadow-md"
            />
          </div>

          <button
            onClick={fetchCategories}
            className="p-2.5 bg-white border border-gray-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95 shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-secondary-gold to-secondary-gold-dark text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-secondary-gold/20 hover:shadow-secondary-gold/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            <PlusCircle size={20} />
            Add New Category
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500 font-medium">
        Showing <span className="text-gray-900 font-bold">{categories.length}</span> of <span className="text-gray-900 font-bold">{totalCount}</span> categories
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider">ID</div>
            <div className="col-span-8 text-xs font-black text-slate-400 uppercase tracking-wider">Category Name</div>
            <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-20 flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-navy border-t-secondary-gold mb-4"></div>
              <p className="text-gray-500 font-medium">Loading Categories...</p>
            </div>
          ) : categories.length > 0 ? (
            categories.map((cat, index) => (
              <div
                key={cat.id}
                className="px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                style={{ animationDelay: `${index * 50} ms` }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* ID */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      #{cat.id}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="col-span-8">
                    <span className="font-bold text-slate-900 group-hover:text-primary-navy transition-colors text-lg">
                      {cat.categoryName}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first category."}
              </p>
              {!searchQuery && (
                <button
                  onClick={openCreateModal}
                  className="text-secondary-gold font-semibold hover:underline"
                >
                  Create your first category
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* ---------------- MODAL (CREATE / EDIT) ---------------- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100"
          >
            <div className="bg-gradient-to-r from-primary-navy to-primary-navy-light p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editMode ? <Pencil size={20} /> : <PlusCircle size={20} />}
                {editMode ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Artificial Intelligence"
                value={form.categoryName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryName: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-secondary-gold/50 focus:border-secondary-gold transition-all"
              />

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-secondary-gold to-secondary-gold-dark text-white 
                                   shadow-lg shadow-secondary-gold/20 hover:shadow-secondary-gold/40 hover:-translate-y-0.5 transition-all"
                >
                  {editMode ? "Update Category" : "Create Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRM ---------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border-t-4 border-red-500">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle size={28} />
              <h3 className="font-bold text-xl text-gray-900">Delete Category?</h3>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.categoryName}"</span>?
              This action cannot be undone and might affect associated courses.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-red-300 hover:-translate-y-0.5 transition-all"
                onClick={handleDelete}
              >
                Yes, Delete It
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
