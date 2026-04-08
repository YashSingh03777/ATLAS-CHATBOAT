import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            // Fetch all threads from deployed backend
            const response = await fetch("https://atlas-chatboat.onrender.com/api/threads");

            // Old local URL (for development)
            // const response = await fetch("http://localhost:8080/api/threads");

            const res = await response.json();

            // Safe check: handle object or array
            const threadsArray = Array.isArray(res) ? res : res.data || [];

            const filteredData = threadsArray.map(thread => ({
                threadId: thread.threadId,
                title: thread.title
            }));

            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(`https://atlas-chatboat.onrender.com/api/thread/${newThreadId}`);

            // Old local URL (for development)
            // const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);

            const res = await response.json();

            const prevChats = Array.isArray(res) ? res : res.data || [];
            setPrevChats(prevChats);

            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`https://atlas-chatboat.onrender.com/api/thread/${threadId}`, { method: "DELETE" });

            // Old local URL (for development)
            // const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, { method: "DELETE" });

            const res = await response.json();
            console.log(res);

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if (threadId === currThreadId) {
                createNewChat();
            }

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="src/assets/bluelogo.png" alt="gpt logo" className="logo"></img>
                <span style={{ marginLeft: "10px" }}><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                {allThreads?.map((thread, idx) => (
                    <li key={idx}
                        onClick={() => changeThread(thread.threadId)}
                        className={thread.threadId === currThreadId ? "highlighted" : ""}
                    >
                        {thread.title}
                        <i className="fa-solid fa-trash"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                        ></i>
                    </li>
                ))}
            </ul>

            <div className="sign">
                <p>During IBM Internship &hearts;</p>
            </div>
        </section>
    );
}

export default Sidebar;
