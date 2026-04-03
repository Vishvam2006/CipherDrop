import { Check, MailPlus, RefreshCw, UserCheck, UserX, Wifi, WifiOff } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState.jsx'
import { Loader } from '../ui/Loader.jsx'

function FriendRow({ friend, isActive, isSelected, onSelect }) {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
      isSelected
        ? 'bg-[var(--accent-light)] border-[var(--accent-mid)]'
        : 'bg-[var(--bg-subtle)] border-[var(--border)] hover:border-[var(--border-accent)]'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
            isActive
              ? 'bg-[var(--green-bg)] text-[var(--green)] border border-[var(--green-border)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]'
          }`}>
            {friend.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{friend.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isActive
                ? <><Wifi size={10} className="text-[var(--green)]" /><span className="text-[11px] text-[var(--green)] font-medium">Online</span></>
                : <><WifiOff size={10} className="text-[var(--text-muted)]" /><span className="text-[11px] text-[var(--text-muted)]">Offline</span></>
              }
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(friend._id)}
          className={`btn shrink-0 text-xs py-2 px-3 rounded-lg font-semibold ${
            isSelected ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          {isSelected ? <><Check size={12} />Selected</> : 'Select'}
        </button>
      </div>
    </div>
  )
}

function RequestRow({ request, accepting, onAccept }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-light)] border border-[var(--accent-mid)] flex items-center justify-center font-bold text-sm text-[var(--accent)] shrink-0">
            {request.requestor?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {request.requestor?.email || 'Unknown'}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Wants to exchange files</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onAccept(request._id)}
          disabled={accepting}
          className="btn btn-primary shrink-0 text-xs py-2 px-3 rounded-lg"
        >
          {accepting ? (
            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <><UserCheck size={12} />Accept</>
          )}
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
      <div className="card p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Your friends</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {friends.length} connected · {activeCount} online now
            </p>
          </div>
          <button type="button" onClick={onRefresh} disabled={loading || refreshing}
            className="btn btn-ghost text-xs gap-1.5">
            <RefreshCw size={12} className={loading || refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Add friend form */}
        <form onSubmit={onSendRequest}
          className="flex flex-col sm:flex-row gap-2 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
          <input
            type="email"
            value={friendEmail}
            onChange={(e) => onFriendEmailChange(e.target.value)}
            placeholder="friend@example.com"
            className="premium-input flex-1 text-sm"
          />
          <button type="submit" disabled={sendingRequest} className="btn btn-primary whitespace-nowrap text-sm">
            <MailPlus size={13} />
            {sendingRequest ? 'Sending…' : 'Add friend'}
          </button>
        </form>

        {/* Friend rows */}
        <div>
          {loading ? (
            <Loader label="Loading friends…" />
          ) : friends.length === 0 ? (
            <EmptyState
              title="No friends yet"
              description="Send a request by email above. Once accepted, you can exchange files."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {friends.map((friend) => (
                <FriendRow
                  key={friend._id}
                  friend={friend}
                  isActive={activeFriendSet.has(friend._id)}
                  isSelected={selectedFriendId === friend._id}
                  onSelect={onSelectFriend}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending requests */}
      <div className="card p-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">Pending requests</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Accept to allow file exchange.
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <span className="tag w-fit">{pendingRequests.length} waiting</span>
        )}

        <div>
          {loading ? (
            <Loader label="Loading requests…" />
          ) : pendingRequests.length === 0 ? (
            <EmptyState
              title="No pending requests"
              description="New friend requests will appear here for you to approve."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {pendingRequests.map((req) => (
                <RequestRow
                  key={req._id}
                  request={req}
                  accepting={acceptingRequestIds.includes(req._id)}
                  onAccept={onAcceptRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
