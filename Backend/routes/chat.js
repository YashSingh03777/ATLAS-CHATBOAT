import express from "express";
import Thread from "../models/Thread.js";
import getOpenAPIResponse from "../utils/googlegemini.js";

const router = express.Router();

// test 
router.post("/test", async(req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread2"
        });
            const response = await thread.save();
            res.send(response);
    }  catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to save in DB"});
    }
});

// 1. GET all threads
router.get("/thread", async(req, res) => {
    try {
          const threads = await Thread.find({}).sort({ updatedAt: -1 });
         // descending order of updatedAt.... most recent data on top 
         res.json(threads);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch threads"});
    }
});

   // 2. GET --> To get all threads 
   router.get("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;
    try{
        const thread = await Thread.findOne({threadId});

        if(!thread) {
            res.status(404).json({error: "Thread is not found"});
        }
        res.json(thread.message);
    } catch(err) {
       console.log(err);
       res.status(500).json({error: "Failed to fetch chat"}); 
    }
   });

   // 3.  DELETE Route 
   router.delete("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread) {
            res.status(404).json({error: "Thread could not be deleted"});
        }

        res.json(200).json({success: "Thread deleted successfully"});

    }  catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to delete thread"});
    }
   });

   // 4. Chat route 
  router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }

  try {
    // use let because we may reassign if thread does not exist
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      // create new thread
      thread = new Thread({
        threadId,
        title: message,
        message: [{ role: "user", content: message }] // note singular 'message'
      });
    } else {
      // ensure message array exists
      if (!thread.message) thread.message = [];

      thread.message.push({ role: "user", content: message });
    }

    // call Google Gemini API
    const assistantReply = await getOpenAPIResponse(message);

    // push assistant reply
    thread.message.push({ role: "assistant", content: assistantReply });

    thread.updatedAt = new Date();

    await thread.save();

    res.json({ reply: assistantReply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  }
});


export default router;