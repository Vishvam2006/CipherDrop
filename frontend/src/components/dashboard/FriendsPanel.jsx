import { Check, MailPlus, RefreshCw, UserCheck, Wifi, WifiOff } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState.jsx'
import { Loader }     from '../ui/Loader.jsx'

function FriendRow({ friend, isActive, isSelected, onSelect }) {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
      isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 hover:border-indigo-200'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
            isActive
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            {friend.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{friend.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isActive
                ? <><Wifi size={10} className="text-green-500" /><span className="text-[11px] text-green-600 font-medium">Online</span></>
                : <><WifiOff size={10} className="text-gray-400" /><span className="text-[11px] text-gray-400">Offline</span></>}
            </div>
          </div>
        </div>
        <button
          type="button" onClick={() => onSelect(friend._id)}
          className={`flex items-center gap-1 shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
          }`}
          style={isSelected ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}
        >
          {isSelected ? <><Check size={11} />Selected</> : 'Select'}
        </button>
      </div>
    </div>
  )
}

function RequestRow({ request, accepting, onAccept }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-200 transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-500 shrink-0">
            {request.requestor?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{request.requestor?.email || 'Unknown'}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Wants to exchange files</p>
          </div>
        </div>
        <button
          type="button" onClick={() => onAccept(request._id)} disabled={accepting}
          className="flex items-center gap-1 shrink-0 text-xs font-semibold px-3 py-1.5 text-white rounded-lg disabled:opacity-50 cursor-pointer transition-all"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          {accepting
            ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <><UserCheck size={11} />Accept</>}
        </button>
      </div>
    </div>
  )
}

export function FriendsPanel({
  friendEmail, loading, refreshing, sendingRequest,
  pendingRequests, friends, activeFriendIds, selectedFriendId,
  acceptingRequestIds, onFriendEmailChange, onSendRequest,
  onAcceptRequest, onSelectFriend, onRefresh,
}) {
  const activeFriendSet = new Set(activeFriendIds)
  const activeCount = friends.filter((f) => activeFriendSet.has(f._id)).length

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">

      {/* Friends list */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900">Your friends</p>
            <p className="text-xs text-gray-400 mt-0.5">{friends.length} connected · {activeCount} online now</p>
          </div>
          <button
            type="button" onClick={onRefresh} disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-all"
          >
            <RefreshCw size={12} className={loading || refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Add friend */}
        <form onSubmit={onSendRequest} className="flex flex-col sm:flex-row gap-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <input
            type="email" value={friendEmail}
            onChange={(e) => onFriendEmailChange(e.target.value)}
            placeholder="friend@example.com"
            className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <button
            type="submit" disabled={sendingRequest}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 hover:opacity-90 cursor-pointer whitespace-nowrap transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            <MailPlus size={13} />
            {sendingRequest ? 'Sending…' : 'Add friend'}
          </button>
        </form>

        <div>
          {loading ? (
            <Loader label="Loading friends…" />
          ) : friends.length === 0 ? (
            <EmptyState title="No friends yet" description="Send a request by email above. Once accepted, you can exchange files." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {friends.map((f) => (
                <FriendRow key={f._id} friend={f}
                  isActive={activeFriendSet.has(f._id)}
                  isSelected={selectedFriendId === f._id}
                  onSelect={onSelectFriend} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending requests */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div>
          <p className="text-sm font-bold text-gray-900">Pending requests</p>
          <p className="text-xs text-gray-400 mt-0.5">Accept to allow file exchange.</p>
        </div>

        {pendingRequests.length > 0 && (
          <span className="w-fit inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            {pendingRequests.length} waiting
          </span>
        )}

        <div>
          {loading ? (
            <Loader label="Loading requests…" />
          ) : pendingRequests.length === 0 ? (
            <EmptyState title="No pending requests" description="New requests will appear here for you to approve." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {pendingRequests.map((req) => (
                <RequestRow key={req._id} request={req}
                  accepting={acceptingRequestIds.includes(req._id)}
                  onAccept={onAcceptRequest} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
