import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLock,
  FaCreditCard,
  FaShoppingCart,
  FaCheck,
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaSpinner,
  FaCopy,
  FaTimes,
  FaMoneyBillWave,
} from "react-icons/fa";
import confetti from "canvas-confetti";
import ApiService from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [verificationPin, setVerificationPin] = useState("");

  const [formData, setFormData] = useState({
    // UK-style Address Fields
    fullName: "",
    streetAddress: "",
    cityTown: "",
    county: "",
    postcode: "",
    phoneNumber: "",

    // Billing Address
    sameAsShipping: true,
    billingName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",

    // Payment Details
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    paymentMethod: "card",

    // Order Notes
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const cartData = await ApiService.getCart();
        setCart(cartData);

        if (cartData.items.length === 0) {
          navigate("/cart");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const calculateTotal = () => {
    return cart.items
      .reduce((total, cartItem) => {
        return total + (cartItem.item?.price || 0) * cartItem.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Format card number with spaces
      let formattedValue = value;
      if (name === "cardNumber") {
        formattedValue = value
          .replace(/\s/g, "")
          .replace(/(.{4})/g, "$1 ")
          .trim();
        if (formattedValue.length > 19)
          formattedValue = formattedValue.substring(0, 19);
      }

      // Format expiry date
      if (name === "expiryDate") {
        formattedValue = value
          .replace(/\D/g, "")
          .replace(/(\d{2})(\d)/, "$1/$2");
        if (formattedValue.length > 5)
          formattedValue = formattedValue.substring(0, 5);
      }

      // Format CVV
      if (name === "cvv") {
        formattedValue = value.replace(/\D/g, "");
        if (formattedValue.length > 4)
          formattedValue = formattedValue.substring(0, 4);
      }

      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // UK-style address validation
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.streetAddress.trim())
      newErrors.streetAddress = "Street address is required";
    if (!formData.cityTown.trim()) newErrors.cityTown = "City/Town is required";
    if (!formData.county.trim()) newErrors.county = "County is required";
    if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";

    // Payment validation - only validate card details if payment method is card
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber.replace(/\s/g, ""))
        newErrors.cardNumber = "Card number is required";
      if (!formData.expiryDate)
        newErrors.expiryDate = "Expiry date is required";
      if (!formData.cvv) newErrors.cvv = "CVV is required";
      if (!formData.cardName.trim())
        newErrors.cardName = "Cardholder name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const orderPayload = {
        items: cart.items.map((cartItem) => ({
          itemId: cartItem.item._id,
          quantity: cartItem.quantity,
          sellerId: cartItem.item.seller._id,
        })),
        shippingAddress: {
          name: formData.fullName,
          address: formData.streetAddress,
          city: formData.cityTown,
          state: formData.county,
          zipCode: formData.postcode,
          phone: formData.phoneNumber,
        },
        billingAddress: formData.sameAsShipping
          ? {
              name: formData.fullName,
              address: formData.streetAddress,
              city: formData.cityTown,
              state: formData.county,
              zipCode: formData.postcode,
            }
          : {
              name: formData.billingName,
              address: formData.billingAddress,
              city: formData.billingCity,
              state: formData.billingState,
              zipCode: formData.billingZip,
            },
        paymentMethod: formData.paymentMethod,
        paymentDetails:
          formData.paymentMethod === "card"
            ? {
                cardNumber: formData.cardNumber,
                cardType: getCardType(formData.cardNumber),
                cardName: formData.cardName,
              }
            : {
                method: "cash",
              },
        notes: formData.notes,
        verificationPin: Math.floor(1000 + Math.random() * 9000).toString(),
      };

      // First create a pending order
      const pendingOrder = await ApiService.createPendingOrder(orderPayload);
      
      // Show user the pending order and payment options
      alert(`Order created! Total: £${(pendingOrder.order.totalAmount).toFixed(2)}. Complete payment to confirm.`);
      
      // For now, auto-complete the order (in real app, user would choose to pay)
      setTimeout(async () => {
        try {
          const completedOrder = await ApiService.createOrderFromCart(orderPayload);
          setOrderData(completedOrder.order);

          // Use the PIN from the order payload
          setVerificationPin(orderPayload.verificationPin);

          setOrderComplete(true);
          setShowPinPopup(true);

          // Trigger beautiful confetti animation
          triggerConfetti();
        } catch (error) {
          console.error("Error completing order:", error);
          alert("Payment confirmation failed. Your order is still pending.");
        }
      }, 3000); // 3 second delay to simulate pending state
    } catch (error) {
      console.error("Error processing order:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, "");
    if (number.startsWith("4")) return "Visa";
    if (number.startsWith("5")) return "Mastercard";
    if (number.startsWith("3")) return "American Express";
    return "Unknown";
  };

  const triggerConfetti = () => {
    // Multiple confetti bursts for amazing effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Burst from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
      });

      // Burst from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
      });
    }, 250);

    // Big burst in center
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
      });
    }, 500);
  };

  const copyPinToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationPin);
      alert("PIN copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = verificationPin;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert("PIN copied to clipboard!");
      } catch (err) {
        alert("Failed to copy PIN");
      }
      document.body.removeChild(textArea);
    }
  };

  const steps = [
    { number: 1, title: "Review Cart", icon: <FaShoppingCart /> },
    { number: 2, title: "Contact Info", icon: <FaUser /> },
    { number: 3, title: "Payment", icon: <FaCreditCard /> },
    { number: 4, title: "Complete", icon: <FaCheck /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center animate-fade-in-up">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 animate-bounce">
              <FaCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order has been successfully placed. Order number:{" "}
            <strong>{orderData?.orderNumber}</strong>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/browse")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* PIN Popup Modal */}
        {showPinPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Verification PIN
                </h3>
                <button
                  onClick={() => setShowPinPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  Please use this PIN for order verification:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <span className="text-3xl font-bold text-blue-600 tracking-widest">
                    {verificationPin}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  You may be asked to provide this PIN verbally for verification
                  purposes.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={copyPinToClipboard}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowPinPopup(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate("/cart")}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <FaCheck className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-primary-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 w-16 h-0.5 transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-primary-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Review Cart */}
              {currentStep === 1 && (
                <div className="animate-fade-in-right">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Review Your Items
                  </h2>
                  <div className="space-y-4">
                    {cart.items.map((cartItem) => (
                      <div
                        key={cartItem.item._id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={
                            cartItem.item.images?.[0] ||
                            "https://via.placeholder.com/100x100?text=No+Image"
                          }
                          alt={cartItem.item.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {cartItem.item.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Quantity: {cartItem.quantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Seller: {cartItem.item.seller?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            $
                            {(cartItem.item.price * cartItem.quantity).toFixed(
                              2
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="bg-primary-600 text-white py-2 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
                    >
                      Continue to Contact Info
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <div className="animate-fade-in-right">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FaUser className="mr-2" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.phoneNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="07123 456789"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.streetAddress
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Street address"
                      />
                      {errors.streetAddress && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.streetAddress}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City/Town
                      </label>
                      <input
                        type="text"
                        name="cityTown"
                        value={formData.cityTown}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.cityTown ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="City/Town"
                      />
                      {errors.cityTown && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cityTown}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County
                      </label>
                      <input
                        type="text"
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.county ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="County"
                      />
                      {errors.county && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.county}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.postcode ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="SW1A 1AA"
                      />
                      {errors.postcode && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.postcode}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="bg-primary-600 text-white py-2 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div className="animate-fade-in-right">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FaCreditCard className="mr-2" />
                    Payment Information
                  </h2>

                  <div className="mb-6">
                    <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <FaLock className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-700">
                        Your payment information is secure and encrypted
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          formData.paymentMethod === "card"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod: "card",
                          }))
                        }
                      >
                        <div className="flex items-center justify-center flex-col text-center">
                          <FaCreditCard className="h-8 w-8 text-primary-600 mb-2" />
                          <span className="font-medium text-gray-900">
                            Credit/Debit Card
                          </span>
                          <span className="text-sm text-gray-500">
                            Pay with card
                          </span>
                        </div>
                      </div>

                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          formData.paymentMethod === "cash"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod: "cash",
                          }))
                        }
                      >
                        <div className="flex items-center justify-center flex-col text-center">
                          <FaMoneyBillWave className="h-8 w-8 text-green-600 mb-2" />
                          <span className="font-medium text-gray-900">
                            Cash on Exchange
                          </span>
                          <span className="text-sm text-gray-500">
                            Pay when you meet
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Payment Details - Only show if card is selected */}
                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.cardName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Name as it appears on card"
                        />
                        {errors.cardName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.cardName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.cardNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {errors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              errors.expiryDate
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.expiryDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              errors.cvv ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="123"
                            maxLength="4"
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Payment Info - Only show if cash is selected */}
                  {formData.paymentMethod === "cash" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center mb-3">
                        <FaMoneyBillWave className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">
                          Cash on Exchange Selected
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mb-2">
                        You have chosen to pay with cash when you meet the seller. Please
                        ensure you have the exact amount ready for the exchange.
                      </p>
                      <div className="text-sm text-green-600 font-medium">
                        Total Amount to Pay: ${calculateTotal()}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any special instructions for your order..."
                    />
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={processOrder}
                      disabled={processing}
                      className="bg-primary-600 text-white py-2 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {processing ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Complete Order"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4">
                {cart.items.map((cartItem) => (
                  <div
                    key={cartItem.item._id}
                    className="flex justify-between text-sm"
                  >
                    <span className="truncate mr-2">
                      {cartItem.item.title} × {cartItem.quantity}
                    </span>
                    <span className="font-medium">
                      ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-lg text-primary-600">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p className="flex items-center">
                  <FaLock className="mr-1" />
                  Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
