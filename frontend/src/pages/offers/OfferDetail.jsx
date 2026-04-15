import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CheckCircle, Download, ExternalLink, Calendar, User, ChevronRight } from 'lucide-react';
import { useOfferStore } from '../../store';
import { getOfferStatusColor } from '../../utils/helpers';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOffer } = useOfferStore();
  const offer = getOffer(id);

  if (!offer) return (
    <div className="card text-center py-16 text-gray-400">
      <p>Offer not found</p>
      <button onClick={() => navigate('/offers')} className="btn-primary mt-4">Back to Offers</button>
    </div>
  );

  const daysLeft = offer.daysLeft;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <button onClick={() => navigate('/offers')} className="btn-ghost flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Offers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className={`card border-l-4 ${offer.status === 'Open' ? 'border-l-success' : offer.status === 'Closed' ? 'border-l-error' : 'border-l-accent'}`}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
                {offer.companyName?.[0]}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-primary">{offer.role}</h1>
                <div className="text-gray-500 mt-0.5">{offer.companyName}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`badge ${getOfferStatusColor(offer.status)}`}>{offer.status}</span>
                  <span className="badge badge-primary">{offer.offerType}</span>
                  <span className="badge badge-accent">{offer.companyType}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-accent">{offer.package}</div>
                {offer.deadline && (
                  <div className={`text-xs mt-1 ${daysLeft <= 3 ? 'text-error font-bold' : 'text-gray-400'}`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Closed'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="card">
            <h2 className="section-title mb-3">Job Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{offer.description}</p>
          </div>

          {/* Eligibility */}
          <div className="card">
            <h2 className="section-title mb-3">Eligibility Criteria</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-500 w-32">Eligible Branches</div>
                <div className="flex flex-wrap gap-1">
                  {(offer.eligibleBranches || []).map(b => (
                    <span key={b} className="badge badge-primary">{b}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-500 w-32">Eligible Batch</div>
                <span className="badge badge-gray">{offer.eligibleBatch}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-500 w-32">CGPA Cutoff</div>
                <span className="text-sm font-bold text-primary">{offer.cgpaCutoff}+</span>
              </div>
            </div>
          </div>

          {/* Selection Process */}
          {offer.process && (
            <div className="card">
              <h2 className="section-title mb-3">Selection Process</h2>
              <div className="space-y-2">
                {offer.process.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-gray-700">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <div className="card sticky top-24">
            <h2 className="section-title mb-4">Apply Now</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-gray-400" />
                <span className="text-gray-600">Deadline: <strong>{offer.deadline}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-600">{offer.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">Posted: {offer.postedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-400" />
                <span className="text-gray-600">{offer.postedBy}</span>
              </div>
            </div>
            {offer.status === 'Open' ? (
              <a
                href={offer.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
              >
                Apply / Register <ExternalLink size={14} />
              </a>
            ) : (
              <div className="mt-4 text-center text-sm text-error font-medium bg-red-50 p-3 rounded-lg">
                This offer is {offer.status.toLowerCase()}
              </div>
            )}
            <button className="btn-outline w-full flex items-center justify-center gap-2 mt-2">
              <Download size={14} /> Download JD
            </button>
          </div>

          {/* Company Link */}
          <div className="card">
            <h2 className="section-title mb-2">About the Company</h2>
            <p className="text-sm text-gray-600 mb-3">{offer.companyName} is a leading {offer.companyType?.toLowerCase()} company.</p>
            <Link to={`/companies/${offer.companyId}`} className="btn-ghost w-full flex items-center justify-center gap-2">
              View Company Profile <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
