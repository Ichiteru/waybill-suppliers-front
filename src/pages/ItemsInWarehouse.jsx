import React, {useEffect, useState} from 'react';
import {useFetching} from "../hooks/useFetching";
import {getPageCount} from "../utils/pages";
import Button from "../components/UI/button/Button";
import Loader from "../components/UI/loader/Loader";
import Pagination from "../components/UI/pagination/Pagination";
import Select from "../components/UI/select/Select";
import WarehouseItemTable from "../components/warehouse-item/WarehouseItemTable";
import WarehouseItemService from "../API/WarehouseItemService";

function ItemsInWarehouse() {
    const [items, setItems] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [limit, setLimit] = useState(10)
    const [status, setStatus] = useState('ALL')
    const [page, setPage] = useState(1)
    const [newItems, setCount] = useState(0)
    const [changedItems, setChanged] = useState([])

    const [fetchItems, isItemsLoading, itemError] = useFetching(async (limit, status, page) => {
        let itemsResponse = await WarehouseItemService.getAll(limit, page, status)
        let countResponse = await WarehouseItemService.getCount(status)
        setItems([...itemsResponse.data])
        setTotalPages(getPageCount(countResponse.data, limit))
    })

    const changePage = (page) => {
        if (!isNaN(page)) {
            setPage(Number(page))
        }
    }

    const changeStatus = (id, value) => {
        let item
        let newStatus
        value
            ? newStatus = 'ACTIVE'
            : newStatus = 'INACTIVE'
        console.log(changedItems.filter(listItem => listItem.item.id === id).length)
        if (changedItems.filter(listItem => listItem.item.id === id).length === 0) {
            item = items.filter(item => item.item.id === id)[0];
            item.activeStatus = newStatus
            setChanged([...changedItems, item])
        } else {
            item = changedItems.filter(listItem => listItem.item.id === id)[0]
            item.activeStatus = newStatus
            setChanged([...changedItems])
        }
        console.log(changedItems)
    }

    const updateItems = () => {
        if (changedItems.length !== 0) {
            for (let item of changedItems) {
                WarehouseItemService.changeStatus(item).then(() => {
                    setCount(newItems + 1)
                })
            }
            setChanged([])
        }
    }

    useEffect(() => {
        fetchItems(limit, status, page)
    }, [limit, status, page, newItems])

    return (
        <div className='container' style={{marginTop: 30}}>
            {itemError &&
            <h1>Error: ${itemError}</h1>
            }
            {isItemsLoading
                ? <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}><Loader/></div>
                : <WarehouseItemTable items={items} changedItems={changedItems} change={changeStatus}
                                      title="Items in Warehouse:"/>
            }
            <div className="container">
                <Button style={{height: 'fit-content', float: 'right'}} onClick={() => updateItems()}>
                    Enable/Disable
                </Button>
                <div style={{float: 'right'}}>
                    <Select
                        value={status}
                        onChange={value => {
                            setStatus(value)
                            setPage(1)
                        }}
                        options={[
                            {value: 'ALL', name: 'show all items'},
                            {value: 'ACTIVE', name: 'only active'},
                            {value: 'INACTIVE', name: 'only inactive'}
                        ]}
                    />
                </div>
                <div style={{float: 'right'}}>
                    <Select
                        value={limit}
                        onChange={value => {
                            setLimit(value)
                            setPage(1)
                        }}
                        options={[
                            {value: 10, name: '10'},
                            {value: 20, name: '20'}
                        ]}
                    />
                </div>
            </div>
            <div>
                <Pagination
                    page={page}
                    changePage={changePage}
                    totalPages={totalPages}
                />
            </div>
        </div>
    );
}

export default ItemsInWarehouse;