import React from 'react'
import "./style.css"
import { parseTranslation } from './posHighlighter'

const Header = (props) => {
    let date = new Date()
    return (
        <tbody>
            <tr>
                <td></td>
                <td>{props.title}</td>
                <td>{`${date.toLocaleString()}`}</td>
                <td>{props.note}</td>
            </tr>
        </tbody>
    )
}

const TableBody = (props) => {
    const rows = props.tableData.map((row, index) => {
        return (
            <tr key={index}>
                <td className='td_index'>{index + 1}</td>
                <td className='td_word' width="20%">{row.word}</td>
                <td className='td_phonetic' width="20%">{row.phonetic}</td>
                <TransTd transArr={row.transArr}></TransTd>
            </tr>
        )
    })

    return <tbody>{rows}</tbody>
}

const TransTd = (props) => {
    const transRows = props.transArr.map((tran, index) => {
        const segments = parseTranslation(tran)
        return (
            <div className='td_trans_oneline' key={index}>
                {segments.map((seg, segIndex) => {
                    if (seg.isPos) {
                        return (
                            <span
                                key={segIndex}
                                style={{ fontWeight: 'bold', color: seg.color }}
                            >{seg.text}</span>
                        )
                    }
                    return <span key={segIndex}>{seg.text}</span>
                })}
            </div>
        )
    })
    return <td className='td_trans' width="60%">{transRows}</td>
}



export { TableBody, Header }
