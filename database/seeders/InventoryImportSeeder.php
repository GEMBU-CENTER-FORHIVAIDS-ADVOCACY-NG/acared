<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\PriceList;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventoryImportSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teamId = 4;
        $drugFormId = 9;

        $items = [
            ['product_id' => '1064', 'batch_id' => '', 'product_name' => 'Glucometer  strip (One touch )', 'unit_price' => 0.00, 'sale_price' => 250.00, 'quantity' => 100.00, 'warning_level' => 50.00, 'uom' => 'Inj'],
            ['product_id' => '21010', 'batch_id' => '', 'product_name' => 'Syringe, 10 ML With Needle  20g 1"', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 543.00, 'warning_level' => 50.00, 'uom' => 'Other'],
            ['product_id' => '21015', 'batch_id' => '', 'product_name' => 'Syringe, Bulb, Ear/Nose, (Adult)', 'unit_price' => 2000.00, 'sale_price' => 2000.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'Other'],
            ['product_id' => '21020', 'batch_id' => '', 'product_name' => 'Hypo Flow Scalp Vein', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'Other'],
            ['product_id' => '30002', 'batch_id' => '', 'product_name' => 'Field Stain A', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 2.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30003', 'batch_id' => '', 'product_name' => 'Field Stain B', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 2.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30004', 'batch_id' => '', 'product_name' => 'HBSAg Strip', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30011', 'batch_id' => '', 'product_name' => 'Vacutainer Tube', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 5800.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30012', 'batch_id' => '', 'product_name' => 'Protec Cyflow tube (RohrenTubes)', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 2000.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30013', 'batch_id' => '', 'product_name' => 'Pestour Pipette', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 500.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30014', 'batch_id' => '', 'product_name' => 'Microscope Slides', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 100.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30016', 'batch_id' => '', 'product_name' => 'Widal Kits', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30027', 'batch_id' => '', 'product_name' => 'Glucometer Machine', 'unit_price' => 12000.00, 'sale_price' => 19000.00, 'quantity' => 2.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30028', 'batch_id' => '', 'product_name' => 'GOT (AST)', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 52.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30029', 'batch_id' => '', 'product_name' => 'Hema Screen (FOB)', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30030', 'batch_id' => '', 'product_name' => 'Hydrogen (2L)', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'liquid'],
            ['product_id' => '30031', 'batch_id' => '', 'product_name' => 'Hydrogen Peroxide 20volv', 'unit_price' => 150.00, 'sale_price' => 265.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'liquid'],
            ['product_id' => '30042', 'batch_id' => '', 'product_name' => 'PAS (WB/SP)', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 6.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30043', 'batch_id' => '', 'product_name' => 'Pipett tips Blue', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1000.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30044', 'batch_id' => '', 'product_name' => 'Pipett Tips Yellow', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1000.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30046', 'batch_id' => '', 'product_name' => 'Steril Swab Sticks', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 100.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30047', 'batch_id' => '', 'product_name' => 'Syphilis Strip (V.D.R.L.)', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 126.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30048', 'batch_id' => '', 'product_name' => 'Uni Gold', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 3.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30049', 'batch_id' => '', 'product_name' => 'Universal Specimen Container', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 92.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30050', 'batch_id' => '', 'product_name' => 'Urea Strip', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30051', 'batch_id' => '', 'product_name' => 'Protec Cyflow tube (RohrenTubes)', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1500.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '30053', 'batch_id' => '', 'product_name' => 'Urinalysis Strips', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'Lab'],
            ['product_id' => '15015', 'batch_id' => '', 'product_name' => 'Povidone-iodine 10% solution (for preparing the skin) 2L', 'unit_price' => 6500.00, 'sale_price' => 8125.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'liquid'],
            ['product_id' => '41006', 'batch_id' => '', 'product_name' => 'Sayana Press', 'unit_price' => 2450.00, 'sale_price' => 305.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'inj'],
            ['product_id' => '41014', 'batch_id' => '', 'product_name' => 'Stander  only', 'unit_price' => 800.00, 'sale_price' => 1000.00, 'quantity' => 0.00, 'warning_level' => 50.00, 'uom' => 'IV'],
            ['product_id' => 'NLFF1HQQ', 'batch_id' => '', 'product_name' => 'H-Pylori', 'unit_price' => 350.00, 'sale_price' => 700.00, 'quantity' => 105.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'EU7T46NM', 'batch_id' => '', 'product_name' => 'creatinine reagent', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 36.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'YECTZZXL', 'batch_id' => '', 'product_name' => 'urea reagent', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 16.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'X1RKB2US', 'batch_id' => '', 'product_name' => 'Potassium', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 27.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'TZA7LWAL', 'batch_id' => '', 'product_name' => 'Uric Acid', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'B1RDQXXD', 'batch_id' => '', 'product_name' => 'Bilirubin', 'unit_price' => 2.95, 'sale_price' => 5.00, 'quantity' => 10.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'LV4AIESS', 'batch_id' => '', 'product_name' => 'Calcium', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'XZXSCQ2C', 'batch_id' => '', 'product_name' => 'HDL', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'MVKWIC0A', 'batch_id' => '', 'product_name' => 'Total Cholesterol', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'ENHVCH8G', 'batch_id' => '', 'product_name' => 'Anti A,B,D', 'unit_price' => 6500.00, 'sale_price' => 6500.00, 'quantity' => 1.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'TJJ8QIZY', 'batch_id' => '', 'product_name' => 'Sodium', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 50.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'R8NZQP8Z', 'batch_id' => '', 'product_name' => 'Gram +v disc', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 32.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'CCFJVAV8', 'batch_id' => '', 'product_name' => 'Gram -v disc', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 29.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'YRSIBXBH', 'batch_id' => '', 'product_name' => 'ALT reagent', 'unit_price' => 15.00, 'sale_price' => 15.00, 'quantity' => 120.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'NV31ZHMU', 'batch_id' => '', 'product_name' => 'AST reagent', 'unit_price' => 1800.00, 'sale_price' => 1800.00, 'quantity' => 120.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '9UDS4OKQ', 'batch_id' => '', 'product_name' => 'Total protein', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 100.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'LWQ4WDRI', 'batch_id' => '', 'product_name' => 'ALBUMIN', 'unit_price' => 35.00, 'sale_price' => 35.00, 'quantity' => 47.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'JYDU20MT', 'batch_id' => '', 'product_name' => 'HBsAg', 'unit_price' => 0.00, 'sale_price' => 500.00, 'quantity' => 224.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'IFGSRFMY', 'batch_id' => '', 'product_name' => 'HCV', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 64.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'VYWMIAX4', 'batch_id' => '', 'product_name' => 'VDRL', 'unit_price' => 120.00, 'sale_price' => 500.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'IM8EUGYQ', 'batch_id' => '', 'product_name' => 'One touch strips', 'unit_price' => 0.00, 'sale_price' => 500.00, 'quantity' => 100.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'JNMGBFS8', 'batch_id' => '', 'product_name' => 'Pregnancy test strips', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 118.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'LQZGDXDR', 'batch_id' => '', 'product_name' => 'FOB', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 2.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'LV7ZZNR8', 'batch_id' => '', 'product_name' => 'PSA', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 4.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '4GOCSEPT', 'batch_id' => '', 'product_name' => 'Hepatitis Profile', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 16.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'FYTGAMOC', 'batch_id' => '', 'product_name' => 'C.L.E.D', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'GEBP2DUM', 'batch_id' => '', 'product_name' => 'MACCONKEY agar', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'CREGGFG6', 'batch_id' => '', 'product_name' => 'Nutrient agar', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '3INQNAYX', 'batch_id' => '', 'product_name' => 'Tryglycolate', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'VE8DDLNP', 'batch_id' => '', 'product_name' => 'Deoxycolate agar', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '4BH5PBZD', 'batch_id' => '', 'product_name' => 'Peptone water', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '79KSACTO', 'batch_id' => '', 'product_name' => 'S/S agar', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'KPAWUQII', 'batch_id' => '', 'product_name' => 'Celolose paper', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'WFBNFRKD', 'batch_id' => '', 'product_name' => 'Tris buffer salt', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 13.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'G8SBLCHX', 'batch_id' => '', 'product_name' => 'EDTA Tubs', 'unit_price' => 54.00, 'sale_price' => 120.00, 'quantity' => 438.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '4LATAMC3', 'batch_id' => '', 'product_name' => 'Plane tubs', 'unit_price' => 60.00, 'sale_price' => 120.00, 'quantity' => 96.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'JHJWL9IK', 'batch_id' => '', 'product_name' => 'Lithium heparin tubes', 'unit_price' => 0.00, 'sale_price' => 120.00, 'quantity' => 80.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'OCILJGKK', 'batch_id' => '', 'product_name' => 'Floride oxalate tubes', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 250.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'RDKZKMOW', 'batch_id' => '', 'product_name' => 'Speciment bottles', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 390.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'NHZVKOKA', 'batch_id' => '', 'product_name' => 'Lancets', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 300.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'QYKO4Z7S', 'batch_id' => '', 'product_name' => 'ESR tubes/stands', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 77.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'N9AYUOZH', 'batch_id' => '', 'product_name' => 'Applicator sticks', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 1776.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'Y690NXE6', 'batch_id' => '', 'product_name' => 'Microscope slides', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 100.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'LORFHJFE', 'batch_id' => '', 'product_name' => 'Blood bags 450mls', 'unit_price' => 0.00, 'sale_price' => 3000.00, 'quantity' => 10.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'AOD0ZWFJ', 'batch_id' => '', 'product_name' => 'Blood giving sets', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 10.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '6ANHDSWB', 'batch_id' => '', 'product_name' => 'Blood bags 250mls', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'HBJGCXGN', 'batch_id' => '', 'product_name' => 'suction bulbs', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '07P1LTC6', 'batch_id' => '', 'product_name' => 'Capilary tubs', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 500.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'NPAZMF5M', 'batch_id' => '', 'product_name' => 'Widal', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'QIRY2UDT', 'batch_id' => '', 'product_name' => 'YELLOW PIPPET TIPS', 'unit_price' => 2.50, 'sale_price' => 5.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'LQGY3YQS', 'batch_id' => '', 'product_name' => 'BLUE PIPPET TIPS', 'unit_price' => 2.33, 'sale_price' => 5.00, 'quantity' => 400.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'VF98OS3J', 'batch_id' => '', 'product_name' => 'COVER SLIP', 'unit_price' => 15.00, 'sale_price' => 15.00, 'quantity' => 700.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'URINBSPJCXI', 'batch_id' => '', 'product_name' => 'URINALYSIS STRIPS', 'unit_price' => 50.00, 'sale_price' => 500.00, 'quantity' => 28.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '125AV4WK', 'batch_id' => '', 'product_name' => 'PLASTERSEAL', 'unit_price' => 100.00, 'sale_price' => 150.00, 'quantity' => 6.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'DYNKEIV2', 'batch_id' => '', 'product_name' => 'DETERMINE', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 345.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => 'M63ITO9P', 'batch_id' => '', 'product_name' => 'UNIGOLD', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 0.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '7CQTGHW6', 'batch_id' => '', 'product_name' => 'STAT-PAK', 'unit_price' => 0.00, 'sale_price' => 0.00, 'quantity' => 31.00, 'warning_level' => 0.00, 'uom' => ''],
            ['product_id' => '8W1OKCOL', 'batch_id' => '', 'product_name' => 'microscope slide', 'unit_price' => 500.00, 'sale_price' => 1000.00, 'quantity' => 288.00, 'warning_level' => 0.00, 'uom' => ''],
        ];

        $created = 0;
        $skipped = 0;

        foreach ($items as $item) {
            $sku = $item['batch_id'] ?: $item['product_id'];

            $priceList = PriceList::firstOrCreate(
                ['team_id' => $teamId, 'name' => $item['product_name']],
                [
                    'category_id' => 2,
                    'uom' => $item['uom'] ?: null,
                    'is_inventory' => true,
                    'is_category' => false,
                    'price' => $item['sale_price'],
                ]
            );

            Inventory::updateOrCreate(
                ['team_id' => $teamId, 'sku' => $sku],
                [
                    'price_list_id' => $priceList->id,
                    'drug_form_id' => $drugFormId,
                    'min_qty' => (int) $item['warning_level'],
                    'quantity' => $item['quantity'],
                    'price' => $item['sale_price'],
                    'cost' => $item['unit_price'],
                    'expires_at' => Carbon::now()->addYears(2),
                ]
            );

            if ($priceList->wasRecentlyCreated) {
                $created++;
            } else {
                $skipped++;
            }
        }

        $this->command->info("Import complete: {$created} new, {$skipped} updated.");
    }
}
