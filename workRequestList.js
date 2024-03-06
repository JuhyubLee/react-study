import { useEffect, useState } from "react";
import * as Common from "../../../components/Common";
import {useForm} from "../../../components/useForm";
import dayjs from "dayjs";
import Contents from "../../../components/Contents";
import Header from "../../../components/Header";
import SearchForm from "../../../components/SearchForm";
import Controls from "../../../components/Controls";
import GridForm from "../../../components/GridForm";
/*import ButtonGroupForm from "../../../components/ButtonGroupForm";
import {AddButton} from "../../../components/ButtonForm";*/
import Popup from "../../../components/Popup";
import PopupForm from "../workRequest/popup/workRequestPopup";

//-- 변수 초기값 세팅
const initialFValues = {
    workType: '',
    progress: '',
    searchStartDate: '',
    searchEndDate: '',
    svcWorkType: 'L',
    empNo: 'EMP008',
    pageNo: 1,
    menuId: '0001'  // 메뉴아이디(필수!!!)
}

/**
 * WorkRequestList 함수형 컴포넌트 (2024.02.21 jhlee)
 */
const WorkRequestList = () => {
    const [openPopup, setOpenPopup] = useState(false); //-- 팝업오픈
    const [workRequestList, setWorkRequestList] = useState([]) //-- axios 에서 받아온 출퇴근수정요청 데이터
    const [recordForEdit, setRecordForEdit] = useState([]); //-- PopupForm 컴포넌트에 전달한 prop
    const [selectionModel, setSelectionModel] = useState([]) //-- 그리드에서 선택된 Row
    const [param , setParam] = useState(initialFValues); //-- 검색조건 파라메터

    /**
     * 상태관리 Custom Hook (2024.02.21 jhlee)
     * initialFValues 사용시 필수
     * initialFValues 에 있는 변수를 사용자가 입력할 때 입력한 값의 유효성을 검사함.(validate Function)
     */
    const {
        values,
        setValues,
        handleInputChange,
    } = useForm(initialFValues, false);

    /**
     * useEffect Hook (2024.02.21 jhlee)
     * 두번 째 매개변수인 'param' 값이 변경될 때마다 HTTP 요청을 보냄.
     */
    useEffect( ()=> {
        setWorkRequestList([]) //-- 리스트 초기화
        Common.getRequest(
            {
                url:"/ur/workRequest/search",
                method:"get",
                data:param
            }
        ).then((res)=>{
            console.log("[workRequestList][SUCCESS]")
            setWorkRequestList([...res.workRequestResult]) //-- workRequestList 변수에 응답값을 복사
        }).catch((err)=>{
            console.log("[workRequestList][ERROR] " + err)
            Common.alert(err.resMessage)
        })

    },[param])

    /**
     * 조회 버튼 클릭 함수 (2024.02.21 jhlee)
     * 해당 함수 호출 시 param 변수의 데이터에 values 변수 데이터를 복사함.
     */
    const handleClick = () => {
        setParam({...values});
    }

    /**
     * 근무종류 selectBox 데이터 (2024.02.21 jhlee)
     * TODO :: 공통코드에서 가져와야 함
     */
    const workTypeSelectData = [
        { code: "OUT", name: "외근"},
        { code: "TRIP", name: "출장"},
        { code: "NORMAL", name: "정상근무"},
        { code: "EARLY", name: "조기퇴근"},
    ];

    /**
     * 진행상태 selectBox 데이터 (2024.02.21 jhlee)
     * TODO :: 공통코드에서 가져와야 함
     */
    const workProgressTypeSelectData = [
        { code: "APPLY", name: "신청"},
        { code: "OK", name: "승인"},
        { code: "CANCEL", name: "반려"},
        { code: "HOLD", name: "보류"},
    ];

    /**
     * 그리드 컬럼 정의 (2024.02.21 jhlee)
     * field : 컬럼에 매핑할 데이터 ID
     * headerName : 헤더명
     * headerAlign : 헤더 정렬 방식
     * flex/width : 너비 지정
     * valueGetter : 데이터 변환 또는 format 함수
     */
    const columns = [
        {
            field: "workType",
            headerName: "근무종류",
            headerAlign: "center",
            align: "center",
            width:150
        },
        {
            field: "workDate",
            headerName: "근무일자",
            headerAlign: "center",
            align: "center",
            valueGetter: ({ value }) => value && dayjs(value).format("YYYY-MM-DD"),
            width:150
        },
        {
            field: "startWorkTime",
            headerName: "시작시간",
            headerAlign: "center",
            align: "center",
            width:150
        },
        {
            field: "endWorkTime",
            headerName: "종료시간",
            headerAlign: "center",
            align: "center",
            width:150
        },
        {
            field: "workDescription",
            headerName: "요청사유",
            headerAlign: "center",
            flex: 1
        },
        {
            field: "workProgressType",
            headerName: "진행상태",
            headerAlign: "center",
            align: "center",
            width:150
        },
    ];

    return (
        <Contents>
            <Header title="출퇴근수정요청 목록"/>
            <SearchForm onClick={handleClick}>
                <Controls.Label text="근무일자"/>
                <Controls.DateRangePickers
                    name="searchDate"
                    onChange={(newValue) => setValues({
                        ...values,
                        "searchStartDate": dayjs(newValue[0]).format("YYYYMMDD"),
                        "searchEndDate": dayjs(newValue[1]).format("YYYYMMDD")
                    })}
                />
                <Controls.Label text="근무종류"/>
                <Controls.Select
                    name="workType"
                    value={values.workType || ''} //-- 선택이 필수가 아닐경우 빈문자열 제공
                    onChange={handleInputChange}
                    options={workTypeSelectData}
                />
                <Controls.Label text="진행상태"/>
                <Controls.Select
                    name="progress"
                    value={values.workProgressType || ''} //-- 선택이 필수가 아닐경우 빈문자열 제공
                    onChange={handleInputChange}
                    options={workProgressTypeSelectData}
                />
            </SearchForm>

            {/* 테이블 형식의 데이터를 표시하는 grid 컴포넌트 */}
            <GridForm
                columns={columns}
                rows={workRequestList}
                checkboxSelection={false}
                onRowDoubleClick={(params) => { setOpenPopup(true); setRecordForEdit(params.row);}}
                onSelectionModelChange={(newSelectionModel) => { //-- Grid 에서 선택한 항목이 변경될 때 실행되는 함수
                    setSelectionModel(newSelectionModel);
                }}
                selectionModel={selectionModel} //-- Grid 에서 현재 선택된 항목의 모델을 지정
                getRowId={(row) => row.workRequestSeq} //-- 고유 식별Id
                >
                {/* 여러개의 버튼을 그룹화하는 컴포넌트 */}
{/*                <ButtonGroupForm>
                    <AddButton
                        onClick={() => { setOpenPopup(true); setRecordForEdit(null); }}
                        name="등록"/>
                </ButtonGroupForm>*/}
            </GridForm>
            {/* 모달 창을 나타내는 컴포넌트 */}
            <Popup
                title="상세확인"
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
            >
                {/* 모달 창 안에 표시되는 폼 컴포넌트 */}
                <PopupForm
                    recordForEdit={recordForEdit} />
            </Popup>
        </Contents>
    );
}

/**
 * 해당 파일에서 정의된 컴포넌트를 내보내는 문구
 */
export default WorkRequestList;