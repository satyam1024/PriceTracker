import { useState } from "react";
import axios from "axios";
const Modal = ({ productId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const addUserEmail = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/add-user-email`,
        {
          productId: productId,
          userEmail: email,
        }
      );
      console.log("User email added successfully:", response.data);
    } catch (error) {
      console.log("Failed to fetch product", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await addUserEmail();

    setIsSubmitting(false);
    setEmail("");
    closeModal();
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        Track
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div
            className="fixed inset-0"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            className="dialog-content transform transition-transform scale-95 opacity-100 animate-modal"
            role="dialog"
          >
            <div className="flex z-50  flex-col">
              <div className="flex justify-between">
                <div className="p-3 border border-gray-200 rounded-10">
                  <img
                    src="/assets/icons/logo.svg"
                    alt="logo"
                    width={28}
                    height={28}
                  />
                </div>

                <img
                  src="/assets/icons/x-close.svg"
                  alt="close"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                  onClick={closeModal}
                />
              </div>

              <h4 className="z-50  dialog-head_text">
                Stay updated with product pricing alerts right in your inbox!
              </h4>

              <p className="text-sm text-gray-600 mt-2">
                Never miss a bargain again with our timely alerts!
              </p>
            </div>

            <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="dialog-input_container">
                <img
                  src="/assets/icons/mail.svg"
                  alt="mail"
                  width={18}
                  height={18}
                />

                <input
                  required
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="dialog-input"
                />
              </div>

              <button type="submit" className="dialog-btn">
                {isSubmitting ? "Submitting..." : "Track"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
