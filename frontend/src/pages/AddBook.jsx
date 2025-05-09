import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { bookSchema } from "@/schema";
import SelectGenreCombobox from "@/components/SelectGenreCombobox";
import genres from "@/utilities/genres";
import { useSetRecoilState } from "recoil";
import { pageTitleAtom } from "@/atoms/meta";
import { toast } from "sonner";

const AddBook = () => {
  const setPageTitle = useSetRecoilState(pageTitleAtom);
  useEffect(() => setPageTitle("Add Book"), []);

  const form = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      genre: [],
      image: "",
      pdf: "",
      year_published: new Date().getFullYear(),
      price: 0,
    },
  });

  const navigate = useNavigate();
  const imageRef = form.register("image");
  const pdfRef = form.register("pdf");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("author", values.author);
    formData.append("year_published", values.year_published);
    formData.append("description", values.description);
    formData.append("genre", JSON.stringify(values.genre));
    formData.append("price", values.price);

    if (values.image) formData.append("image", values.image[0]); // Ensure single file
    if (values.pdf) formData.append("pdf", values.pdf[0]); // Fix: Ensure it's a single file

    console.log("FormData Entries:", Array.from(formData.entries()));

    let promise = axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/books`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast.promise(promise, {
      loading: "Uploading book...",
      success: (response) => {
        navigate("/books/");
        return response.data.message;
      },
      error: (error) => error.response.data.message,
      finally: () => setIsLoading(false),
    });
  };

  return (
    <div className="grid flex-1 gap-4 p-4 sm:px-6 md:gap-8">
      <Card className="w-full max-w-xl mx-auto rounded-lg shadow-md overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="border-b border-slate-200 dark:border-zinc-800">
              <CardTitle>Add Book</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-3 py-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-3">
                    <FormLabel className="text-left">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Title of the Book" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-2">
                    <FormLabel className="text-left">Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author of the Book" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year_published"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className="text-left">Year</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Year Published"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-3">
                    <FormLabel className="text-left">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a brief summary of the book..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-3">
                    <FormLabel className="text-left">Genre</FormLabel>
                    <FormControl>
                      <SelectGenreCombobox
                        options={genres}
                        name="Genre"
                        form={form}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-1">
                    <FormLabel className="text-left">Price (INR)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-2">
                    <FormLabel>Book Cover Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        placeholder="Upload Book Thumbnail"
                        ref={field.ref}
                        onChange={(event) => field.onChange(event.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pdf"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-2">
                    <FormLabel>PDF File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="application/pdf"
                        ref={field.ref}
                        onChange={(event) => field.onChange(event.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t border-slate-200 px-6 py-4 dark:border-zinc-800">
              {isLoading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button type="submit">Submit</Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AddBook;
