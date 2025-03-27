import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, amount, paymentMethod, customerId, machineId } = location.state || {
    orderId: 0,
    amount: "0đ",
    paymentMethod: "Chưa xác định",
    customerId: null,
    machineId: null,
  };

  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saveOrder = async () => {
      try {
        const response = await fetch("https://coffeeshop.ngrok.app/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            OrderDate: new Date().toISOString(),
            OrderCode: `ORD-${Date.now()}`, // Sinh mã đơn hàng tạm thời
            OrderDescription: "Thanh toán đơn hàng tại máy",
            TotalAmount: parseFloat(amount.replace(/[^\d.]/g, "")), // Chuyển số tiền về dạng số
            Status: 1, // 1: Thành công
            CustomerId: customerId && customerId !== 0 ? customerId : null, // Nếu CustomerId = 0, đặt null
            MachineId: machineId || 1, // Nếu không có MachineId, đặt mặc định là 0
          }),
        });

        if (!response.ok) {
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }

        console.log("Lưu đơn hàng thành công");
      } catch (err) {
        console.error("Lỗi khi lưu đơn hàng:", err.message);
        setError("Không thể lưu đơn hàng. Vui lòng thử lại.");
      }
    };

    saveOrder();

    // Bắt đầu đếm ngược để chuyển trang
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/process");
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate, orderId, amount, paymentMethod, customerId, machineId]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-grow flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-600 mt-2">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>

          <div className="mt-6 text-left">
            <p className="text-gray-700 font-medium">
              Mã đơn hàng: <span className="font-semibold">{orderId}</span>
            </p>
            <p className="text-gray-700 font-medium">
              Số tiền: <span className="font-semibold">{amount}</span>
            </p>
            <p className="text-gray-700 font-medium">
              Phương thức: <span className="font-semibold">{paymentMethod}</span>
            </p>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          <p className="mt-6 text-gray-500 text-sm">
            Tự động chuyển trang sau <span className="font-bold">{countdown}</span> giây...
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
