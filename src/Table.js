import React, { Component } from 'react'
import "./style.css"

const Header = (props) => {
    let date = new Date()
    return (
        // <thead>
        <tbody>
            <tr>
                <td></td>
                <td>{props.title}</td>
                <td>{`${date.toLocaleString()}`}</td>
                <td>{props.note}</td>
            </tr>
        </tbody>
        // </thead>
    )
}

const TableBody = (props) => {
    const rows = props.tableData.map((row, index) => {
        return (
            <tr key={index}>
                <td className='td_index'>&nbsp;{index + 1}</td>
                <td className='td_word' width="20%" >&nbsp;{row.word}</td>
                <td className='td_phonetic' width="20%">&nbsp;{row.phonetic}</td>
                <TransTd transArr={row.transArr}></TransTd>
            </tr>
            // <div key={index} className="tr">
            //     <div className='td_word'>{row.word}</div>
            //     <div className='td_phonetic'>{row.phonetic}</div>
            //     <div className='td_trans'>{row.trans}</div>
            // </div>
        )
    })

    return <tbody>{rows}</tbody>
}

const TransTd = (props) => {
    const transRows = props.transArr.map((tran, index) => {
        return (
            <div className='td_trans_oneline' key={index}>{tran}</div>
        )
    })
    return <td className='td_trans' width="60%">{transRows}</td>
}



export { TableBody, Header }
