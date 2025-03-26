import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import loadingImage from '../../assets/images/loading.svg';
import productPlaceholder from '../../assets/images/placeholder-image.webp';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { cartActions } from '../../redux/slices/cart.slice';
import useDocumentTitle from '../../utils/documentTitle';
import { n_f } from '../../utils/helpers';
import { FaTrash } from 'react-icons/fa';

function Cart() {
  const cartRedux = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [product, setProduct] = useState(null);

  const [form, setForm] = useState({
    payment: "",
    kohiUserName: "",
    kohiPassword: "",
  });

  useDocumentTitle("My Cart");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setIsLoading(true);
        const response = await fetch(`https://coffeeshop.ngrok.app/api/product/${productId}`);
        const data = await response.json();
        if (response.ok) {
          setProduct(data);
          dispatch(cartActions.replaceCart({ items: [data] }));
        } else {
          toast.error("Không thể tải dữ liệu sản phẩm");
        }
      } catch (error) {
        console.error("Lỗi fetch:", error);
        toast.error("Lỗi khi lấy dữ liệu sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [dispatch, productId]);
  
  const handlePaymentChange = (e) => {
    setForm((prev) => ({ ...prev, payment: e.target.value }));
  };

  const handleVerify = () => {
    if (!form.kohiUserName || !form.kohiPassword) {
      toast.error("❌ Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }
    if (form.kohiUserName === "testuser" && form.kohiPassword === "123456") {
      setIsVerified(true);
      toast.success("✅ Xác thực thành công!");
    } else {
      setIsVerified(false);
      toast.error("❌ Sai thông tin đăng nhập, vui lòng thử lại.");
    }
  };

  const payHandler = () => {
    if (!form.payment || (form.payment === "1" && (!form.kohiUserName || !form.kohiPassword || !isVerified))) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const randomOrderId = `#${Math.floor(100000 + Math.random() * 900000)}`;
      if (form.payment === "1") {
        // Thanh toán bằng Ví KOHI
        toast.success("Giao dịch thành công!");
        dispatch(cartActions.resetCart());
        navigate("/successful", {
          state: {
            orderId: randomOrderId,
            amount: `${n_f(product?.price)} VND`,
            paymentMethod: "Ví KOHI",
          },
        });
      } else if (form.payment === "2") {
        // Chuyển sang trang thanh toán ngân hàng
        const paymentUrl = `https://banking-payment.com/pay?amount=${product?.price}`;
        window.location.href = paymentUrl;
      }
      setIsLoading(false);
    }, 2000);
  };

  return (
    <>
      <Header />
      <main className="bg-gray-100 min-h-screen flex flex-col items-center p-6">
        <div className="bg-white max-w-4xl w-full rounded-lg shadow-md p-6">
          <h2 className="text-center text-2xl font-bold text-gray-700 mb-6">Đơn hàng</h2>
          {isLoading ? (
            <img src={loadingImage} alt="Loading" className="mx-auto" />
          ) : product ? (
            <div className="flex items-center gap-4 border-b pb-4 justify-between">
              <div className="flex items-center gap-4">
                <img src={isEmpty(product?.img) ? productPlaceholder : product?.img} alt="Product" className="w-20 h-20 object-cover rounded-lg" />
                <div>
                  <p className="font-semibold">{product?.productName}</p>
                  <p className="text-lg text-gray-700">{n_f(product?.price)} VND</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-lg font-bold text-gray-500">Không có sản phẩm</p>
          )}

          <h2 className="text-xl font-bold text-gray-700 mt-6">Phương thức thanh toán</h2>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" value="1" checked={form.payment === "1"} onChange={handlePaymentChange} disabled={!product} /> Ví KOHI
            </label>
            {form.payment === "1" && product && (
              <div className="space-y-2">
                <input type="text" placeholder="User Name" className="w-full p-2 border rounded" name="kohiUserName" value={form.kohiUserName} onChange={(e) => setForm((prev) => ({ ...prev, kohiUserName: e.target.value }))} />
                <input type="password" placeholder="Password" className="w-full p-2 border rounded" name="kohiPassword" value={form.kohiPassword} onChange={(e) => setForm((prev) => ({ ...prev, kohiPassword: e.target.value }))} />
                <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={handleVerify}>Xác thực</button>
              </div>
            )}
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" value="2" checked={form.payment === "2"} onChange={handlePaymentChange} disabled={!product} /> Bank account
            </label>
          </div>

          <button onClick={payHandler} className="mt-6 w-full bg-green-500 text-white p-3 rounded font-bold" disabled={!form.payment || !product || (form.payment === "1" && !isVerified)}>
            Xác nhận & Thanh toán
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Cart;
