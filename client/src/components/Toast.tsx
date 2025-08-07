import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hideToast, selectToast } from '../store/slices/uiSlice';

const Toast = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.show, dispatch]);

  if (!toast.show) {
    return null;
  }

  const bgColor = toast.type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg max-w-md`}
        role="alert"
      >
        <div className="flex items-center justify-between">
          <p className="font-medium">{toast.message}</p>
          <button
            onClick={() => dispatch(hideToast())}
            className="ml-4 text-white hover:text-gray-100 focus:outline-none"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;