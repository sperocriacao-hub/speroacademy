import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";

interface SearchPageProps {
    searchParams: {
        title: string;
        categoryId: string;
    }
};

const SearchPage = async ({
    searchParams
}: SearchPageProps) => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const { title, categoryId } = await searchParams;

    const categories = await db.category.findMany({
        orderBy: {
            name: "asc"
        }
    });

    const courses = await db.course.findMany({
        where: {
            isPublished: true,
            title: {
                contains: title,
            },
            categoryId,
        },
        include: {
            category: true,
            modules: {
                where: {
                    isPublished: true,
                },
                select: {
                    id: true,
                }
            },
            purchases: {
                where: {
                    userId,
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return (
        <>
            <div className="px-6 pt-6 md:hidden md:mb-0 block">
                <SearchInput />
            </div>
            <div className="p-6 space-y-4">
                <Categories
                    items={categories}
                />
                <CoursesList items={courses} />
            </div>
        </>
    );
}

export default SearchPage;
