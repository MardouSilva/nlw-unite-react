import { ChangeEvent, useEffect, useState } from "react"
import dayjs from "dayjs"
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Search, MoreHorizontal, ChevronsLeft, ChevronLeft, ChevronsRight, ChevronRight } from "lucide-react"
import { IconButton } from "./icon-button"
import { Table } from "./table/table"
import { TableHeader } from "./table/table-header"
import { TableCell } from "./table/table-cell"
import { TableRow } from "./table/table-row"

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

interface Attendee {
    id: number
    name: string
    email: string
    createdAt: string
    checkedInAt: string | null

}

export function AttendeeList(){
    const [search, setSearch] = useState(() => {
        const url = new URL(window.location.toString())

        if(url.searchParams.has('search')){
            return String(url.searchParams.get('search')) ?? '' ;
        }else{
            return '';
        }
    });
    const [page, setPage] = useState(() => {
        const url = new URL(window.location.toString())

        if(url.searchParams.has('page')){
            return Number(url.searchParams.get('page'));
        }else{
            return 1;
        }
    });
    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const url = new URL('http://localhost:3333/events/9e9bd979-9d10-4915-b339-3786b1634f33/attendees')
        url.searchParams.set('pageIndex', String(page - 1))
        url.searchParams.set('query', search)

        fetch(url)
            .then(response => response.json())
            .then( data => {
                setAttendees(data.attendees)
                setTotal(data.total)
            })
    }, [page, search])

    const totalPages = Math.ceil(total/10)

    function setCurrentSearch(search: string){
        const url = new URL(window.location.toString())
        url.searchParams.set('search', search)
        window.history.pushState({}, '', url)
        setSearch(search)
    }
 
    function setCurrentPage(page: number){
        const url = new URL(window.location.toString())
        url.searchParams.set('page', String(page))
        window.history.pushState({}, '', url)
        setPage(page)
    }
    
    function onSearchInputChange(event: ChangeEvent<HTMLInputElement>){
        setCurrentSearch(event.target.value)
        setCurrentPage(1)
    }

    function goToNextPage(){
        setCurrentPage(page + 1)
    }

    function goToPreviousPage(){
        setCurrentPage(page - 1)
    }

    function goToFirstPage(){
        setCurrentPage(1)
    }

    function goToLastPage(){
        setCurrentPage(totalPages)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-center">
                <h1 className="text-2xl font-bold">Participantes</h1>
                <div className="px-3 py-1.5 border border-white/10 rounded-lg w-72 flex items-center gap-3">
                    <Search className="size-4 text-emerald-300"/>
                    <input 
                        type="text"
                        placeholder="Buscar participante..."
                        value={search}
                        onChange={onSearchInputChange}
                        className="bg-transparent flex-1 border-0 p-0 outline-none text-sm focus:ring-0"
                    />
                </div>
            </div>
            <Table>
                <thead>
                    <tr className="border-b border-white/10">
                        <TableHeader>
                            <input type="checkbox" className="size-4 bg-black/20 border border-white/10 rounded"/>
                        </TableHeader>
                        <TableHeader>Código</TableHeader>
                        <TableHeader>Participante</TableHeader>
                        <TableHeader>Data de inscrição</TableHeader>
                        <TableHeader>Data de check-in</TableHeader>
                        <TableHeader style={{ width: 48}}></TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {attendees.map((attendee) => {
                        return (
                            <TableRow key={attendee.id}>
                                <TableCell>
                                    <input type="checkbox" className="size-4 bg-black/20 border border-white/10 rounded "/>
                                </TableCell>
                                <TableCell>{attendee.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-white">{attendee.name}</span>
                                        <span>{attendee.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{dayjs().to(attendee.createdAt)}</TableCell>
                                <TableCell>
                                    {attendee.checkedInAt
                                    ? dayjs().to(attendee.checkedInAt)
                                    : <span className="text-zinc-400">Não fez checkin</span>}</TableCell>
                                <TableCell>
                                    <IconButton transparent>
                                        <MoreHorizontal className="size-4" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <TableCell colSpan={3} className="py-3 px-4 text-sm text-left text-zinc-300">Mostrando {attendees.length} de {total} itens</TableCell>
                        <TableCell colSpan={3} className="py-3 px-4 text-sm text-right text-zinc-300">
                            <div className="inline-flex items-center gap-8">
                                <span>Página {page} de {totalPages}</span>
                                <div className="flex gap-1.5">
                                    <IconButton onClick={goToFirstPage} disabled={ page === 1 }>
                                        <ChevronsLeft className="size-4" />
                                    </IconButton>
                                    <IconButton onClick={goToPreviousPage} disabled={ page === 1 }>
                                        <ChevronLeft className="size-4" />
                                    </IconButton>
                                    <IconButton onClick={goToNextPage} disabled={ page === totalPages }>
                                        <ChevronRight className="size-4" />
                                    </IconButton>
                                    <IconButton onClick={goToLastPage} disabled={ page === totalPages }>
                                        <ChevronsRight className="size-4" />
                                    </IconButton>
                                </div>
                            </div>
                        </TableCell>
                    </tr>
                </tfoot>
            </Table>
        </div>
    )
}