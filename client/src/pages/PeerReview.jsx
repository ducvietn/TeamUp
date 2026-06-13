import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { peerReviewAPI, groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiStar, FiCheck } from 'react-icons/fi';

const PeerReview = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    revieweeId: '',
    score: 5,
    comment: '',
    criteria: {
      communication: 5,
      collaboration: 5,
      responsibility: 5,
      quality: 5
    }
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const [groupRes, statusRes, reviewsRes] = await Promise.all([
        groupAPI.getById(groupId),
        peerReviewAPI.getStatus(groupId),
        peerReviewAPI.getMyReceived(groupId)
      ]);
      setGroup(groupRes.data.data.group);
      setStatus(statusRes.data.data);
      setReviews(reviewsRes.data.data.reviews);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await peerReviewAPI.create({
        groupId,
        revieweeId: formData.revieweeId,
        score: formData.score,
        comment: formData.comment,
        criteria: formData.criteria
      });
      toast.success('Gửi đánh giá thành công!');
      setFormData({
        revieweeId: '',
        score: 5,
        comment: '',
        criteria: { communication: 5, collaboration: 5, responsibility: 5, quality: 5 }
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (count, onChange) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`p-1 ${star <= count ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          <FiStar size={20} fill={star <= count ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đánh giá ngang hàng</h1>
        <p className="text-gray-500 mt-1">Nhóm: {group?.name}</p>
      </div>

      {status?.enabled === false ? (
        <div className="card text-center py-12">
          <FiStar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Đánh giá ngang hàng chưa được bật
          </h3>
          <p className="text-gray-500">
            Trưởng nhóm sẽ bật tính năng này khi cần thiết
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Gửi đánh giá</h3>
            
            {status?.isComplete ? (
              <div className="text-center py-8">
                <FiCheck size={48} className="mx-auto text-green-500 mb-4" />
                <h4 className="font-semibold text-gray-900">Đã hoàn thành!</h4>
                <p className="text-gray-500 mt-2">Bạn đã đánh giá tất cả thành viên</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn thành viên
                  </label>
                  <select
                    value={formData.revieweeId}
                    onChange={(e) => setFormData({ ...formData, revieweeId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Chọn thành viên...</option>
                    {status?.pendingReviews?.map((p) => (
                      <option key={p.user._id} value={p.user._id}>
                        {p.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm tổng quan (1-5)
                  </label>
                  {renderStarRating(formData.score, (v) => setFormData({ ...formData, score: v }))}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Đánh giá chi tiết
                  </label>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giao tiếp</span>
                    {renderStarRating(formData.criteria.communication, (v) => 
                      setFormData({ ...formData, criteria: { ...formData.criteria, communication: v } })
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hợp tác</span>
                    {renderStarRating(formData.criteria.collaboration, (v) => 
                      setFormData({ ...formData, criteria: { ...formData.criteria, collaboration: v } })
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trách nhiệm</span>
                    {renderStarRating(formData.criteria.responsibility, (v) => 
                      setFormData({ ...formData, criteria: { ...formData.criteria, responsibility: v } })
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chất lượng</span>
                    {renderStarRating(formData.criteria.quality, (v) => 
                      setFormData({ ...formData, criteria: { ...formData.criteria, quality: v } })
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét (ẩn danh)
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="input-field min-h-[100px] resize-y"
                    placeholder="Nhận xét về thái độ làm việc của thành viên này..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !formData.revieweeId}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Đánh giá nhận được</h3>
            
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có đánh giá nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={16}
                            fill={i < review.score ? 'currentColor' : 'none'}
                            className={i >= review.score ? 'text-gray-300' : ''}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        Ẩn danh
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                    )}
                    {review.criteria && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <span>Giao tiếp: {review.criteria.communication}/5</span>
                        <span>Hợp tác: {review.criteria.collaboration}/5</span>
                        <span>Trách nhiệm: {review.criteria.responsibility}/5</span>
                        <span>Chất lượng: {review.criteria.quality}/5</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerReview;
