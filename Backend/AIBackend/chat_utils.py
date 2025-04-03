import os
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Define the directories
current_dir = os.path.dirname(os.path.abspath(__file__))
docs_dir = os.path.join(current_dir, "documents")
persistent_directory = os.path.join(current_dir, "db", "chroma_db")

# Custom prompt template
CUSTOM_PROMPT = PromptTemplate(
    template="""You are CrawlShastra's AI assistant, a helpful and knowledgeable chatbot for Honeywell's document management system.
Use the following pieces of context to answer the question at the end. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Always maintain a professional and helpful tone.

Context: {context}

Chat History: {chat_history}

Question: {question}

Helpful Answer:""",
    input_variables=["context", "chat_history", "question"]
)

def initialize_vector_store():
    """
    Initialize or load the vector store with document embeddings.
    """
    persist_directory = "db/chroma_db"
    
    # Initialize Google's embedding model
    embedding = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004"  # Using text-embedding-004 for embeddings
    )
    
    if not os.path.exists(persist_directory):
        print("Initializing vector store...")
        
        if not os.path.exists(docs_dir):
            raise FileNotFoundError(f"Documents directory {docs_dir} does not exist.")

        loader = DirectoryLoader(docs_dir, glob="*.txt", loader_cls=TextLoader)
        documents = loader.load()

        text_splitter = CharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separator="\n"
        )
        docs = text_splitter.split_documents(documents)

        db = Chroma.from_documents(
            docs,
            embedding,
            persist_directory=persist_directory
        )
        return db
    else:
        print("Loading existing vector store...")
        return Chroma(
            persist_directory=persist_directory,
            embedding_function=embedding
        )

def setup_conversation_chain():
    """Set up the conversation chain with the vector store."""
    try:
        vector_store = initialize_vector_store()
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            convert_system_message_to_human=True
        )
        
        # Set up conversation memory with output_key
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"  # Specify which key to store in memory
        )
        
        # Create conversation chain
        conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
            memory=memory,
            combine_docs_chain_kwargs={"prompt": CUSTOM_PROMPT},
            return_source_documents=True,
            verbose=True
        )
        
        return conversation_chain
    except Exception as e:
        return {
            "answer": f"I apologize, but I encountered an error: {str(e)}",
            "sources": []
        }

def get_conversation_response(conversation_chain, question: str) -> dict:
    """
    Get a response from the conversation chain.
    """
    try:
        logger.info("Retrieving answer from conversation chain...")
        result = conversation_chain({"question": question})
        
        # Extract source documents
        source_docs = []
        if "source_documents" in result:
            logger.info(f"Found {len(result['source_documents'])} relevant documents")
            for doc in result["source_documents"]:
                source_docs.append({
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", "Unknown")
                })
                logger.info(f"Using source: {doc.metadata.get('source', 'Unknown')}")
        
        return {
            "answer": result["answer"],
            "sources": source_docs
        }
    except Exception as e:
        logger.error(f"Error in conversation chain: {str(e)}")
        return {
            "answer": f"I apologize, but I encountered an error: {str(e)}",
            "sources": []
        } 