// ============================================================================
// IMPORTS
// ============================================================================

import { useEffect, useMemo, useRef, useState, memo } from "react";
import {
  Phone,
  MapPin,
  Check,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-react";
import productVideo from "./assets/Elshorbagy.mp4";
import logoImg from "./assets/logo.png";
import image1 from "./assets/WhatsApp Image 2026-01-15 at 9.06.42 AM.jpeg";
import image2 from "./assets/WhatsApp Image 2026-01-15 at 9.06.44 AM.jpeg";
import image3 from "./assets/WhatsApp Image 2026-01-15 at 9.06.46 AM.jpeg";
import image4 from "./assets/WhatsApp Image 2026-01-15 at 9.06.47 AM.jpeg";
import { addOrder } from "./api";
import Swal from "sweetalert2";
import branchesData from "./branches.json";
import citiesData from "./cities.json";


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProductPage() {
  // Default company/subCategories
  const DEFAULT_COMPANY_ID = "692fffb4e037d2784032b18f";
  const DEFAULT_SUBCATS = ["69388f1d6d0b1261bbc370c0"];

  // Product details
  const productDetails = {
    name: "طقم علب التلاجة الشوربجي – 18 قطعة",
    price: 0, // Will be set based on your pricing
    description: "علبه بلاستيك، محكمة الغلق 18",
    pieces: [
      "4 علب مستطيلة سعة 500 مل",
      "4 علب مستطيلة مسطحة سعة 500 مل",
      "2 علب مستطيلة سعة 1000 مل",
      "2 علب مستطيلة سعة 3000 مل",
      "2 علبة هرمية الشكل سعة 1000 مل",
      "2 علبة هرمية الشكل سعة 2000 مل",
      "2 علبة مربعة الشكل سعة 3000 مل",
    ],
    features: [
      "18 علبة بأحجام مختلفة تناسب جميع الاستخدامات",
      "مصنوعة من بلاستيك صحي عالي الجودة وآمن على الطعام",
      "مناسبة للاستخدام في الميكروويف وغسالة الأطباق و للحفظ داخل الفريزر",
      "محكمة الغلق ومانعة للتسرب",
      "تصميم عملي يساعد على تنظيم التلاجة وتوفير المساحة",
    ],
    specs: {
      brand: "مجموعة الشوربجي للبلاستيك",
      count: "18 علبة",
      material: "بلاستيك صحي مطابق لمعايير الجودة والسلامة",
      colors: "أزرق / شفاف",
    },
  };

  // Gallery media (video first, then images)
  const galleryMedia = [
    { type: "video", src: productVideo, thumbnail: image1 },
    { type: "image", src: image1 },
    { type: "image", src: image2 },
    { type: "image", src: image3 },
    { type: "image", src: image4 },
  ];

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------

  const [currentMedia, setCurrentMedia] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef(null);

  // --------------------------------------------------------------------------
  // LOOKUPS
  // --------------------------------------------------------------------------

  const citiesByName = useMemo(() => {
    const m = new Map();
    (citiesData || []).forEach((c) => {
      if (c && c.name) m.set(String(c.name).toLowerCase(), c._id);
    });
    return m;
  }, []);

  const citiesById = useMemo(() => {
    const m = new Map();
    (citiesData || []).forEach((c) => {
      if (c && c._id) m.set(c._id, c.name);
    });
    return m;
  }, []);

  const branchesById = useMemo(() => {
    const m = new Map();
    (branchesData || []).forEach((b) => {
      if (b && b._id) m.set(b._id, b);
    });
    return m;
  }, []);

  // --------------------------------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------------------------------

  const unitPrice = 250; // Set your actual price
  const subtotal = unitPrice * quantity;
  const delivery = 0; // Free shipping mentioned in requirements
  const grandTotal = subtotal + delivery;

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleMediaClick = (index) => {
    setCurrentMedia(index);
    if (galleryMedia[index].type === "video" && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const name = form.name?.value?.trim();
    const phone = form.phone?.value?.trim();
    const province = form.province?.value?.trim();
    const address = form.address?.value?.trim();

    if (!name || !phone) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "من فضلك أدخل الاسم ورقم الهاتف",
        confirmButtonColor: "#2f83aa",
      });
      return;
    }

    if (!province || !address) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "من فضلك أدخل المحافظة والعنوان",
        confirmButtonColor: "#2f83aa",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let cityId = null;
      if (province) {
        cityId = citiesByName.get(province.toLowerCase()) || null;
      }

      const orderData = {
        name,
        phone,
        addresses: [{
          area: "",
          street: address,
          landmark: "",
        }],
        city: cityId || "",
        company: DEFAULT_COMPANY_ID,
        subCategories: DEFAULT_SUBCATS,
        items: [{
          item: "fridge-box-18",
          quantity: String(quantity),
        }],
        shippingFee: String(delivery),
        totalDiscount: "0",
        orderOnly: {
          userNote: `طقم علب تلاجة الشوربجي - ${quantity} طقم - ${productDetails.name}`,
        },
      };

      await addOrder(orderData);

      Swal.fire({
        icon: "success",
        title: "تم استلام طلبك!",
        text: "سيتم التواصل معك قريباً",
        confirmButtonColor: "#2f83aa",
      });

      setShowModal(false);
      form.reset();
      setQuantity(1);
    } catch (error) {
      console.error("Order error:", error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ",
        text: "حاول مرة أخرى",
        confirmButtonColor: "#2f83aa",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div
      dir="rtl"
      className="min-h-svh bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-neutral-900"
    >
      {/* ================================================================
          HEADER - Sticky navigation bar with logo
          ================================================================ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-[#2f83aa] shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="الشوربجي للبلاستيك"
              className="w-10 h-10 object-cover rounded-full ring-2 ring-[#2f83aa] ring-offset-2"
            />
            <div className="leading-tight">
              <div className="font-bold text-lg bg-gradient-to-r from-[#2f83aa] to-[#1a5f7a] bg-clip-text text-transparent">
                الشوربجي للبلاستيك
              </div>
              <div className="text-xs text-[#2f83aa]">
                جودة عالية وأمان
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2f83aa]" />
          </div>
        </div>
      </header>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ----------------------------------------
            GALLERY SECTION
            ---------------------------------------- */}
        <section className="space-y-4">
          {/* Main Media Display */}
          <div className="relative overflow-hidden rounded-xl border-2 border-[#2f83aa] bg-black shadow-lg">
            {galleryMedia[currentMedia].type === "video" ? (
              <video
                ref={videoRef}
                src={galleryMedia[currentMedia].src}
                className="w-full h-auto"
                controls
                playsInline
                autoPlay
                muted
              />
            ) : (
              <img
                src={galleryMedia[currentMedia].src}
                alt="علب التلاجة"
                className="w-full h-auto object-cover"
              />
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-5 gap-2">
            {galleryMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => handleMediaClick(index)}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  currentMedia === index
                    ? "border-[#2f83aa] ring-2 ring-[#2f83aa] ring-offset-2 scale-105"
                    : "border-gray-300 hover:border-[#2f83aa]"
                }`}
              >
                <img
                  src={media.type === "video" ? media.thumbnail : media.src}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-16 object-cover"
                />
                {media.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#2f83aa] border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ----------------------------------------
            PRODUCT DETAILS SECTION
            ---------------------------------------- */}
        <section className="space-y-5">
          {/* Product Title */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-[#2f83aa]">
              {productDetails.name}
            </h1>
            <p className="text-lg text-neutral-700">
              {productDetails.description}
            </p>
          </div>

          {/* Product Pieces */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-[#2f83aa]/30">
            <h2 className="font-bold text-lg mb-3 text-[#2f83aa]">
              عدد القطع بالتفصيل:
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              {productDetails.pieces.map((piece, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2f83aa] mt-0.5 flex-shrink-0" />
                  <span>{piece}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="bg-cyan-50 rounded-xl p-4 border-2 border-cyan-200">
            <h2 className="font-bold text-lg mb-3 text-[#2f83aa]">
              مميزات المنتج:
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              {productDetails.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

         

          {/* Quantity Selector - Desktop Only */}
          <div className="hidden lg:block space-y-2">
            <label className="text-sm font-semibold text-neutral-700">
              الكمية:
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="p-2 rounded-lg border-2 border-neutral-300 text-neutral-700 hover:border-[#2f83aa] hover:text-[#2f83aa] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-6 py-2 border-2 border-neutral-300 rounded-lg font-semibold text-lg text-neutral-900 min-w-[80px] text-center">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="p-2 rounded-lg border-2 border-neutral-300 text-neutral-700 hover:border-[#2f83aa] hover:text-[#2f83aa] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Order Now Button */}
          <button
            onClick={handleOrderSubmit}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#2f83aa] to-[#1a5f7a] text-white font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-6 h-6" />
            اطلب الآن
          </button>

          {/* Contact Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300">
            <div className="flex items-center gap-3 justify-center">
              <Phone className="w-5 h-5 text-green-600" />
              <a
                href="tel:01119914401"
                className="text-lg font-bold text-green-700 hover:text-green-900"
              >
                01119914401
              </a>
            </div>
            <p className="text-center text-sm text-green-600 mt-2">
              شحن مجاني لكل محافظات مصر
            </p>
          </div>
        </section>
      </main>

      {/* ================================================================
          CONFIRMATION MODAL
          ================================================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2f83aa] to-[#1a5f7a] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  تأكيد الطلب
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  disabled={isSubmitting}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-lg mb-3 text-[#2f83aa]">
                  تفاصيل الطلب
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">المنتج:</span>
                    <span className="font-semibold text-neutral-900">
                      {productDetails.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">الكمية:</span>
                    <span className="font-semibold text-neutral-900">
                      {quantity} طقم
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <h3 className="font-bold text-lg mb-3">الملخص المالي</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">سعر المنتج:</span>
                    <span className="font-semibold">{subtotal} جنيه</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">سعر التوصيل:</span>
                    <span className="font-semibold">{delivery} جنيه</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-300 pt-2 mt-2">
                    <span className="font-bold text-lg">الإجمالي:</span>
                    <span className="font-bold text-xl text-[#2f83aa]">
                      {grandTotal} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Form */}
            <form onSubmit={handleConfirmOrder} className="p-6 bg-neutral-50 rounded-b-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="الاسم"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f83aa]"
                />
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="رقم الهاتف"
                  pattern="01[0125][0-9]{8}"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f83aa]"
                />
              </div>

              <select
                required
                name="province"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f83aa]"
              >
                <option value="">-- اختر المحافظة --</option>
                {(citiesData || []).map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                required
                name="address"
                type="text"
                placeholder="العنوان التفصيلي"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f83aa]"
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white border-2 border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 transition-colors"
                  disabled={isSubmitting}
                >
                  تعديل
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      تأكيد نهائي
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          STICKY BOTTOM BAR - Mobile Only with Quantity
          ================================================================ */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50">
        <div className="w-full bg-white border-t-2 border-[#2f83aa] shadow-2xl">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 bg-gradient-to-r from-[#2f83aa] to-[#1a5f7a] text-white rounded-lg font-bold text-lg min-w-[60px] text-center shadow-md">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Order Button */}
            <button
              onClick={handleOrderSubmit}
              className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#2f83aa] to-[#1a5f7a] text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              اطلب الآن
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="w-full bg-gradient-to-br from-[#2f83aa] via-[#1a5f7a] to-neutral-800 mt-20 text-white pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="الشوربجي للبلاستيك"
                  className="w-12 h-12 object-cover rounded-full ring-2 ring-cyan-400 ring-offset-2 ring-offset-neutral-900"
                />
                <div>
                  <h3 className="text-2xl font-bold">
                    مجموعة الشوربجي للبلاستيك
                  </h3>
                  <p className="text-xs text-cyan-300">جودة عالية وأمان تام</p>
                </div>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                نظمي تلاجتك بسهولة وخلي كل حاجة في مكانها. 
                منتجات بلاستيكية عالية الجودة وآمنة على الطعام.
              </p>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-300">
                <Phone className="w-5 h-5" />
                تواصل معنا
              </h3>
              <div className="space-y-3">
                <a
                  href="tel:01119914401"
                  className="flex items-center gap-3 text-sm bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all hover:scale-105 border border-white/10"
                >
                  <div className="bg-green-500 p-2 rounded-full">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div dir="ltr" className="text-left">
                    <div className="text-xs text-neutral-400">Phone</div>
                    <div className="text-cyan-200 font-medium">
                      01119914401
                    </div>
                  </div>
                </a>
                <div className="text-sm text-cyan-300">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  شحن مجاني لكل محافظات مصر
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-black/30">
          <div className="mx-auto max-w-6xl px-6 py-4 text-center">
            <span className="text-sm text-neutral-400">
              جميع الحقوق محفوظة © {new Date().getFullYear()} مجموعة الشوربجي للبلاستيك
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
