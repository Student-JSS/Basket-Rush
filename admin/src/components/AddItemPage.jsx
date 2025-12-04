import React, { useRef, useState } from "react";
import { addItemPageStyles as styles } from "../assets/adminStyles";
import axios from "axios";

const initialFormState = {
  name: "",
  description: "",
  category: "",
  oldPrice: "",
  price: "",
  image: null,
  preview: "",
};

const categories = [
  "Fruits",
  "Vegetables",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Bakery",
  "Pantry",
];

const AddItemPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef(null);

  // Optional: for easier usage in JSX
  const { name, description, category, oldPrice, price, preview } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((f) => ({
      ...f,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const removeImage = () => {
    setFormData((f) => ({ ...f, image: null, preview: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("description", formData.description);
      body.append("category", formData.category);
      body.append("oldPrice", formData.oldPrice);
      body.append("price", formData.price);

      if (formData.image) {
        body.append("image", formData.image);
      }

      const res = await axios.post("http://localhost:4000/api/items", body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Created", res.data);
      alert("Product added successfully!");

      setFormData(initialFormState);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("error", err);
      alert("Error adding product. Please try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerContainer}>
        <h1 className={styles.heading}>Add New Product</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.gridContainer}>
          <div>
            <label className={styles.label}>Product Name *</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Category *</label>
            <select
              name="category"
              value={category}
              onChange={handleChange}
              required
              className={styles.input}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className={styles.label}>Description *</label>
          <textarea
            name="description"
            value={description}
            onChange={handleChange}
            required
            className={styles.textarea}
          />
        </div>

        {/* PRICES */}
        <div className={styles.priceGrid}>
          <div>
            <label className={styles.label}>Original Price ($) *</label>
            <input
              type="number"
              name="oldPrice"
              value={oldPrice}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Selling Price ($) *</label>
            <input
              type="number"
              name="price"
              value={price}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className={styles.label}>Product Image *</label>
          <div className={styles.imageUploadWrapper}>
            <div
              className={styles.imageUploadContainer}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className={styles.imagePreview}
                />
              ) : (
                <span>Click to upload image</span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            {preview && (
              <button
                type="button"
                onClick={removeImage}
                className={styles.removeImageButton}
              >
                Remove Image
              </button>
            )}
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddItemPage;
