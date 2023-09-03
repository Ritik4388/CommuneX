import PostCard from "@/components/cards/PostCard";
import { fetchPosts } from "@/constants/actions/post.actions";
import { UserButton, currentUser } from "@clerk/nextjs";

export default async function Home() {
  const { posts, isNext } = await fetchPosts(1, 30);
  const user = await currentUser();
  return (
    <div>
      {/* <UserButton afterSignOutUrl="/"/> */}
      <h1 className="head-text head-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {posts.length === 0 ? (
          <p className="no-result">No posts found</p>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}
