import PostCard from "@/components/cards/PostCard";
import Comment from "@/components/forms/Comment";
import { fetchPostById } from "@/constants/actions/post.actions";
import { fetchUser } from "@/constants/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user?.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const post = await fetchPostById(params?.id);

  console.log(post.children[4]);

  return (
    <section className="relative">
      <div>
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
      </div>

      <div className="mt-7">
        <Comment
          postId={post.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {post.children.map((child: any) => {
          return (
            <PostCard
              key={child._id}
              id={child._id}
              currentUserId={child?.id || ""}
              parentId={child.parentId}
              content={child.text}
              author={child.author}
              community={child.community}
              createdAt={child.createAt}
              comments={child.children}
              isComment
            />
          );
        })}
      </div>
    </section>
  );
};

export default Page;
