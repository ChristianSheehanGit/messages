import { useState, useEffect, useRef } from "react";
import Input from "./Input";

function Test() {
  const [selectedChoice, setSelectedChoice] = useState({});
  const [selectedVotes, setSelectedVotes] = useState({});
  const [votedPosts, setVotedPosts] = useState({});
  const [posts, setPosts] = useState([]);
  const [replyId, setReplyId] = useState([]);
  const [replyOpen, setReplyOpen] = useState([]);
  const [replyLevel, setReplyLevel] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

function timeAgo(timestamp) {
  if (!timestamp) return "<1m ago";

  const secs = timestamp.seconds ?? timestamp._seconds;
  if (!secs) return "<1m ago>";

  const then = new Date(secs * 1000);
  const now = new Date();

  const seconds = Math.floor((now - then) / 1000);

  const intervals = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];

  for (const interval of intervals) {
    const value = Math.floor(seconds / interval.secs);
    if (value > 0) return `${value}${interval.label} ago`;
  }

  return "<1m ago";
}



  const handleFileClick = (file) => {
    const url = `${file.path}`;
    if (!url) return;
    // File extension
    const ext = file.filename.split('.').pop().toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
    const isVideo = ['mp4', 'mov', 'webm', 'avi'].includes(ext);
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext);

    if (isImage) {
      openModal(file, "image");
    } else if (isAudio) {
      openModal(file, "audio");
    } else if (isVideo) {
      openModal(file, "video");
    } else {
      window.open(url, "_blank");
    }
  };

const fetchInitialPosts = async () => {
  try {
    setLoading(true);

    const res = await fetch(
      "https://messagesapi2-616938642091.europe-west1.run.app/getPosts"
    );
    const data = await res.json();

    setPosts(data);
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    setPosts([]);
  } finally {
    setLoading(false);
  }
};

const fetchPosts = async () => {
  try {
    const res = await fetch(
      "https://messagesapi2-616938642091.europe-west1.run.app/getPosts"
    );
    const data = await res.json();

    setPosts(data);
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    setPosts([]);
  }
};


useEffect(() => {
  // Initial fetch
  fetchInitialPosts();
  // Poll every 5 seconds
  const interval = setInterval(fetchPosts, 1000);

  return () => clearInterval(interval); // cleanup
}, []); // empty dependency array!


  const handleVote = async (postId, optionIndex) => {
  try {
    const res = await fetch("https://messagesapi2-616938642091.europe-west1.run.app/updatePoll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, optionIndex })
    });
    
    const data = await res.json();
    setVotedPosts(prev => ({ ...prev, [postId]: true }));
    setSelectedChoice(prev => ({ ...prev, [postId]: optionIndex }));
    fetchPosts();
  } catch (err) {
    console.error("Poll vote failed:", err);
  }
  };

function formatCST(timestamp) {
  if (!timestamp) return "Just now";

  const secs = timestamp.seconds ?? timestamp._seconds;
  if (!secs) return "Just now";

  const d = new Date(secs * 1000);

  const date = d.toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
  });

  const time = d.toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${date} ${time}`;
}




  const handlePostVote = async (postId, newAmount) => {
      let amount = 0;
      if (selectedVotes[postId] === 1) {
        if (newAmount === 1) {
          amount = -1;
          newAmount = 0;
        }
        if (newAmount === -1) {
          amount = -2
        }
      } else if (selectedVotes[postId] === -1) {
        if (newAmount === 1) {
          amount = 2;
        }
        if (newAmount === -1) {
          amount = 1;
          newAmount = 0;
        }
      } else {
        if (newAmount === 1) {
          amount = 1;
        }
        if (newAmount === -1) {
          amount = -1;
        }
      } 
  try {
    const res = await fetch("https://messagesapi2-616938642091.europe-west1.run.app/updateVote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, amount })
    });
    
    setSelectedVotes(prev => ({ ...prev, [postId]: newAmount }));
    const data = await res.json();
    fetchPosts();
  } catch (err) {
    console.error("Vote failed:", err);
  }
  };

  const openModal = (file, type) => {
    setModalContent(file);
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalContent(null);
  };

  // ESC closes modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* MODAL */}
     {modalOpen && modalContent && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <p style={{
              position: "fixed",
                top: "3px",
                left: "20px",
                cursor: "default"
            }}>  {modalContent.path
                   ?.split("/")
                    .pop()
                  ?.replace(/^[^-]+-/, "")}
        </p>
            <button
              onClick={closeModal}
              id="xmark"
              style={{
                position: "fixed",
                top: "12px",
                right: "20px",
                background: "rgba(0,0,0,0)",
                border: "none",
                cursor: "pointer",
                padding: "6px 8px",
                zIndex: 10000,
              }}
            >
              <i className="fa-solid fa-xmark" style={{ color: "#F2F0EF", fontSize: "1.5rem" }} />
            </button>
{modalType === "image" ? (
  <img
    src={`${modalContent.path}`}
    alt=""
    style={{ maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain", cursor: "default" }}
  />
) : modalType === "video" ? (
  <video
    src={`${modalContent.path}`}
    controls
    autoPlay
    style={{ maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain", cursor: "default" }}
  />
) : modalType === "audio" ? (
  <audio
  src={`${modalContent.path}`}
  controls
  autoPlay
  style={{
    width: "366px",        // player width
    margin: "", // center horizontally with top/bottom margin
    display: "block",
    borderRadius: "0px",
  }}
/>
) : null}

          </div>
        </div>
      )}

    <div style={{marginTop:'25px'}}></div>
      <Input
        fileInputId="post"
        replyId={0}
        replyLevel={0}
        setReplyId={setReplyId}
        setReplyOpen={setReplyOpen}
      />
        <div style={{marginTop:'15px'}}></div>
        {loading && (
  <div
    style={{
      width: "180px",
      padding: "10px",
      color: "#F2F0EF",
      textAlign: "center",
      fontSize: "1rem",
      opacity: 0.8,
    }}
  >
    Loading posts…
  </div>
)}
<div style={{ width: "366px" }}>
  {posts.map(post => {
    // Remove empty poll options
    const cleanPoll = post.poll?.filter(opt => opt.trim() !== "");

    return (
      <div
        key={post.id}
        style={{
          width:"466px",
          marginLeft: post.replyLevel !== 0 ? `${post.replyLevel * 50 + 25}px`: '25px',
        }}
        >
          <div>

      <div 
        style={{
          padding: "8px",
          marginBottom: "10px",
          backgroundColor: "#404040",
          width: "350px",
          marginBottom: '10px'
        }}
      >

        {/* Data */}
        <p style={{
          margin: 0,
          display:'flex'
        }}>
          <span>
 <strong>{formatCST(post.createdAt)} CST</strong>
  </span>
  <span style={{ marginLeft: "auto", opacity: 0.7 }}>
    {timeAgo(post.createdAt)}
  </span>
</p>
  
        {/* Body */}
        <pre style={{width: '350px', marginTop:'8px', marginBottom: '8px', whiteSpace: "pre-wrap",  wordWrap: "break-word", overflowWrap: "break-word", fontSize: "1rem", lineHeight: 1.5}}>{post.body}</pre>

{/* Files */}
{post.files?.length > 0 && (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent:'center', gap: '0px', marginBottom: "12px" }}>
    {post.files.map((file, i) => (
      
<p
  key={i}
  onClick={() => handleFileClick(file)}
  style={{
    backgroundColor: "#555555",
    marginTop: "6px",
    marginBottom: "0px",
    marginLeft: "5px",
    marginRight: "5px",
    width: "120px",
    height: "120px",
    whiteSpace: "nowrap",
    textAlign: "center",
    flexShrink: 0,
    cursor: "pointer",         
  }}
  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
>
  {['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.filename.split('.').pop().toLowerCase()) && (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
  <img
    src={`${file.path}`}
    alt=""
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      zIndex: 0
    }}
  />
  <i
    className="fa-solid fa-image"
    style={{
      position: "absolute",
      top: "36%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "1.3rem",
      color: "white",
      opacity: 1,
      pointerEvents: "none"
    }}
  />
  <span 
    style={{ 
      position: "absolute",
      top: "64%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontFamily: "SometypeMono", 
      maxWidth: "95px", 
      overflow: "hidden", 
      whiteSpace: "nowrap", 
      textOverflow: "ellipsis" }}>
        {`${file.filename}`}</span>
</div>

  )}
  {['mp4', 'mov', 'webm', 'avi'].includes(file.filename.split('.').pop().toLowerCase()) && (
<div style={{ position: "relative", width: "100%", height: "100%" }}>
    
    <video
  src={`${file.path}`}
  style={{ width: "100%", height: "100%", objectFit: "cover" }}
  muted
  playsInline
  controls={false}
/>
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      zIndex: 0
    }}
  />
   <i
    className="fa-solid fa-video"
    style={{
      position: "absolute",
      top: "36%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "1.3rem",
      color: "white",
      opacity: 1,
      pointerEvents: "none"
    }}
  />
  <span 
    style={{ 
      position: "absolute",
      top: "64%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontFamily: "SometypeMono", 
      maxWidth: "95px", 
      overflow: "hidden", 
      whiteSpace: "nowrap", 
      textOverflow: "ellipsis" }}>
        {`${file.filename}`}</span>
</div>

  )}

  {['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(file.filename.split('.').pop().toLowerCase()) && (
    <div onClick={(e) => {openModal(file);}} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#F2F0EF", fontSize: "1rem", width: "100%", height: "100%" }}>
                        <i className="fa-solid fa-headphones" style={{ fontSize: "1.3rem", marginBottom: "15px" }} />
                        <span style={{ fontFamily: "SometypeMono", maxWidth: "95px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{`${file.filename}`}</span>
                      </div>

  )}
{!['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'mp4', 'mov', 'webm', 'avi', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.filename.split('.').pop().toLowerCase()) && (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#F2F0EF", fontSize: "1rem", width: "100%", height: "100%" }}>
        <i className="fa-solid fa-paperclip" style={{ fontSize: "1.3rem", marginBottom: "15px" }} />
        <span style={{ fontFamily: "SometypeMono", maxWidth: "95px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{`${file.filename}`}</span>
      </div>
)}
      </p>


    ))}
  </div>
)}
        {/* Poll */}
{cleanPoll?.length > 0 && (
  <div style={{marginTop:'8px', marginBottom:'16px', display:'flex', flexDirection:'column'}}>
      {cleanPoll.map((choice, i) => (
<a
  onClick={!votedPosts[post.id] ? () => handleVote(post.id, i) : undefined}
  className="pollchoice"
  style={{
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
    width: "340px",
    padding: "5px",
    textDecoration: "none",
    cursor: votedPosts[post.id] ? "default" : "pointer",
    pointerEvents: votedPosts[post.id] ? "none" : "auto",
    backgroundColor:
      votedPosts[post.id] && selectedChoice[post.id] === i
        ? "rgba(85, 85, 85, 0.7)"
        : "rgba(85, 85, 85, 1)",
    color:
      votedPosts[post.id] && selectedChoice[post.id] === i
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(255, 255, 255, 1)",
  }}
>
  <span>{choice}</span>
  {votedPosts[post.id] && (
    <span style={{ opacity: 0.8, marginLeft: "auto" }}>
      ({post.pollResults[i]} votes)
    </span>
  )}
</a>
      ))}
  </div>
)}
        <p style={{
          marginBottom: 0,
          marginTop: 10,
          display:'flex'
        }}>
  <span>
<span style={{ marginTop: "15px", marginBottom: "5px" }}>
  <a className="vote-btn"  onClick={() => handlePostVote(post.id, 1)} style={{
    color: selectedVotes[post.id] === 1 ? "rgba(255, 255, 255, 0.7)": "rgba(255, 255, 255, 1)",
  }}>
    <i className="fa-solid fa-arrow-up"></i>
  </a>

  <strong style={{ marginLeft: "10px", marginRight: "10px" }}>
    {post.upvote}
  </strong>

  <a className="vote-btn"   onClick={() => handlePostVote(post.id, -1)} style={{
    color: selectedVotes[post.id] === -1 ? "rgba(255, 255, 255, 0.7)": "rgba(255, 255, 255, 1)",
  }}
>
    <i className="fa-solid fa-arrow-down"></i>
  </a></span>
</span><span style={{marginLeft: "auto" }}>
  <a onClick={() => {
    setReplyId(post.id);
    setReplyLevel(Number(post.replyLevel) + 1);
    if (replyOpen === post.id) {setReplyOpen(0)} else { setReplyOpen(post.id)};
    }} class="vote-btn">
  <i style={{opacity: replyOpen === post.id ? 0.5: 1}} class="fa-solid fa-reply"></i>
  </a></span>
</p>
</div>
</div>
  {replyOpen === post.id && (
  <Input
    fileInputId="reply"
    replyId={replyId}
    replyLevel={replyLevel}
    setReplyId={setReplyId}
    setReplyOpen={setReplyOpen}
  />
)}              
</div>
    );
  })} <div style={{marginTop:'25px'}}></div>
</div>  
    </>
  );
}

export default Test;