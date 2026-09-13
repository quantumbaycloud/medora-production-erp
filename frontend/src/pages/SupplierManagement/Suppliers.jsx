import { useState } from "react";
import SupplierHeader from "../../components/supplierManagement/suppliers/SupplierHeader";
import SupplierCard from "../../components/supplierManagement/suppliers/SupplierCard";
import SupplierModal from "../../components/supplierManagement/suppliers/SupplierModal";
import { supplierData } from "../../data/reports/mockData";
import api, { withPharmacy } from "../../services/api";

// eslint-disable-next-line react-refresh/only-export-components
export const initialSuppliersData = [];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState(supplierData);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    category: "Pharmaceuticals",
    address: "",
    paymentTerms: "Net 30 Days",
    gstin: "",
    status: "Active",
    description: ""
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      category: "Pharmaceuticals",
      address: "",
      paymentTerms: "Net 30 Days",
      gstin: "",
      status: "Active",
      description: ""
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      category: supplier.category,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      gstin: supplier.gstin,
      status: supplier.status,
      description: supplier.description
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.patch(`/suppliers/${selectedSupplier.id}`, { name: formData.name, contact_person: formData.contactPerson, email: formData.email || null, phone: formData.phone || null, address: formData.address || null, gstin: formData.gstin || null, payment_terms: formData.paymentTerms || null }, { params: withPharmacy() });
      setSuppliers((prev) => prev.map((s) => s.id === selectedSupplier.id ? { ...s, ...data, contactPerson: data.contact_person } : s));
      setIsEditModalOpen(false);
    } catch (error) { alert(error?.response?.data?.detail || "Unable to update supplier"); }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/suppliers", { name: formData.name, contact_person: formData.contactPerson || null, email: formData.email || null, phone: formData.phone || null, address: formData.address || null, gstin: formData.gstin || null, payment_terms: formData.paymentTerms || null }, { params: withPharmacy() });
      setSuppliers((prev) => [data, ...prev]);
      setIsAddModalOpen(false);
    } catch (error) { alert(error?.response?.data?.detail || "Unable to create supplier"); }
  };

  return (
    <div className="space-y-6 pb-12">
      <SupplierHeader onAddClick={handleOpenAdd} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            onEditClick={handleOpenEdit}
          />
        ))}
      </div>

      <SupplierModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Manage Supplier Profile"
        subtitle="Update operational contact, status, and terms."
        onSubmit={handleSaveEdit}
        formData={formData}
        setFormData={setFormData}
        submitLabel="Save Changes"
      />

      <SupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Supplier"
        subtitle="Register a new vendor in your supplier directory."
        onSubmit={handleAddSupplier}
        formData={formData}
        setFormData={setFormData}
        submitLabel="Add Supplier"
      />
    </div>
  );
};

export default Suppliers;
