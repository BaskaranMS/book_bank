import { LayoutGrid, Loader2, PlusCircle, Table } from "lucide-react";
import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { bookColumns } from "@/components/bookColumns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
const BookCard = lazy(() => import("@/components/BookCard"));
import useBooks from "@/hooks/useBooks";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userRoleAtom } from "@/atoms/userData";
import { pageTitleAtom } from "@/atoms/meta";
import { toast } from "sonner";
import axios from "axios";

const Homepage = () => {
  const role = useRecoilValue(userRoleAtom);
  const navigate = useNavigate();
  const { books, isLoading } = useBooks();
  const setPageTitle = useSetRecoilState(pageTitleAtom);
  useEffect(() => setPageTitle("The Book Bank"), []);

  const [globalOffer, setGlobalOffer] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const handleGlobalOfferSubmit = async () => {
    if (!globalOffer || isNaN(globalOffer)) return toast.error("Invalid offer");

    setIsSubmittingOffer(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/books/offer`,
        { offer: globalOffer },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setGlobalOffer("");
      toast.success(response.data.message || "Global offer applied!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to apply offer");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <main className="grid flex-1 items-start p-2 sm:px-4 md:gap-8">
      <Tabs defaultValue="block">
        <div className="flex items-center px-2 pt-2">
          <TabsList>
            <TabsTrigger default value="block" className="flex gap-2">
              <LayoutGrid size={20} />{" "}
              <h3 className="not-hidden sm:block">Block</h3>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex gap-2">
              <Table size={20} /> <h3 className="not-hidden sm:block">Table</h3>
            </TabsTrigger>
          </TabsList>
          {role === "admin" && (
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                className="h-10 gap-2"
                onClick={() => {
                  navigate("add");
                }}
              >
                <PlusCircle size={20} />
                Add Book
              </Button>
            </div>
          )}

          {role === "admin" && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Global Offer Price"
                className="border rounded px-2 py-1 w-40 text-black"
                value={globalOffer}
                onChange={(e) => setGlobalOffer(e.target.value)}
              />
              <Button
                size="sm"
                onClick={handleGlobalOfferSubmit}
                disabled={isSubmittingOffer}
              >
                {isSubmittingOffer ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply Offer"
                )}
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="block">
          {isLoading ? (
            <div className="w-full grid items-center">
              <Loader2 className="mx-auto  h-10 w-10 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap">
              {books?.map((book, index) => (
                <BookCard key={index} book={book} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="table" className="grid">
          <DataTable
            searchBy="title"
            columns={bookColumns}
            data={books}
          ></DataTable>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Homepage;
